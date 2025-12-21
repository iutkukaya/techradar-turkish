import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Radar = ({ data, width, height, onHover, onUpdate, isDraggable, colors, settings }) => {
    const svgRef = useRef();
    const nodesRef = useRef([]); // Store nodes to persist positions
    const onHoverRef = useRef(onHover); // Store callback to avoid effect re-run
    const onUpdateRef = useRef(onUpdate);

    const activeNodeRef = useRef(null);

    // Update ref when prop changes
    useEffect(() => {
        onHoverRef.current = onHover;
        onUpdateRef.current = onUpdate;
    }, [onHover, onUpdate]);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Background Rect to capture clicks/hovers on empty space
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("mouseover", () => {
                if (activeNodeRef.current) {
                    d3.select(activeNodeRef.current).select("circle").attr("r", 6).attr("stroke", "white");
                    activeNodeRef.current = null;
                }
                if (onHoverRef.current) onHoverRef.current(null);
            });

        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2 - 20;

        // Configuration
        const rings = [
            settings?.ring1 || 'Benimse',
            settings?.ring2 || 'Test Et',
            settings?.ring3 || 'Değerlendir',
            settings?.ring4 || 'Çık'
        ];
        const quadrants = [
            settings?.quadrant1 || 'Araçlar',
            settings?.quadrant2 || 'Diller ve Çerçeveler',
            settings?.quadrant3 || 'Platformlar',
            settings?.quadrant4 || 'Teknikler'
        ];

        // Ring Radii
        const ringRadii = [maxRadius * 0.4, maxRadius * 0.65, maxRadius * 0.85, maxRadius];

        // Colors
        const ringColors = colors || ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444'];

        // Draw Rings
        rings.forEach((ring, i) => {
            svg.append("circle")
                .attr("cx", centerX)
                .attr("cy", centerY)
                .attr("r", ringRadii[i])
                .attr("fill", "none")
                .attr("stroke", "rgba(255, 255, 255, 0.1)")
                .attr("stroke-width", 2)
                .style("pointer-events", "none"); // Let events pass through to background

            // Ring Label
            svg.append("text")
                .attr("x", centerX)
                .attr("y", centerY - ringRadii[i] + 20)
                .attr("text-anchor", "middle")
                .attr("fill", ringColors[i])
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("text-transform", "uppercase")
                .style("pointer-events", "none")
                .text(ring);
        });

        // Draw Quadrant Lines
        svg.append("line")
            .attr("x1", centerX - maxRadius).attr("y1", centerY)
            .attr("x2", centerX + maxRadius).attr("y2", centerY)
            .attr("stroke", "rgba(255, 255, 255, 0.1)")
            .attr("stroke-width", 2)
            .style("pointer-events", "none");

        svg.append("line")
            .attr("x1", centerX).attr("y1", centerY - maxRadius)
            .attr("x2", centerX).attr("y2", centerY + maxRadius)
            .attr("stroke", "rgba(255, 255, 255, 0.1)")
            .attr("stroke-width", 2)
            .style("pointer-events", "none");

        // Helper to get coordinates (Ideal Position)
        // Now deterministic based on params
        // Helper to find index checking both current and legacy names
        const getQuadrantIndex = (name) => {
            const idx = quadrants.indexOf(name);
            if (idx !== -1) return idx;
            const defaults = ['Araçlar', 'Diller ve Çerçeveler', 'Platformlar', 'Teknikler'];
            return defaults.indexOf(name);
        };

        const getRingIndex = (name) => {
            const idx = rings.indexOf(name);
            if (idx !== -1) return idx;
            const defaults = ['Benimse', 'Test Et', 'Değerlendir', 'Çık'];
            return defaults.indexOf(name);
        };

        // Helper to get coordinates (Ideal Position)
        // Now deterministic based on params
        const getCoordinates = (quadrant, ring, angleParam, radiusParam) => {
            const qIndex = getQuadrantIndex(quadrant);
            const rIndex = getRingIndex(ring);

            if (qIndex === -1 || rIndex === -1) return { x: centerX, y: centerY };

            // Radius within the ring
            const innerR = rIndex === 0 ? 0 : ringRadii[rIndex - 1];
            const outerR = ringRadii[rIndex];
            // Use provided param or default to center (0.5)
            const rParam = radiusParam !== undefined && radiusParam !== null ? radiusParam : 0.5;
            const r = innerR + (outerR - innerR) * (0.2 + 0.6 * rParam); // Keep away from edges (20%-80%)

            // Angle range for quadrant
            let startAngle, endAngle;
            switch (qIndex) {
                case 0: startAngle = Math.PI; endAngle = 1.5 * Math.PI; break;
                case 1: startAngle = 1.5 * Math.PI; endAngle = 2 * Math.PI; break;
                case 2: startAngle = 0; endAngle = 0.5 * Math.PI; break;
                case 3: startAngle = 0.5 * Math.PI; endAngle = Math.PI; break;
                default: startAngle = 0; endAngle = 0;
            }

            // Angle within quadrant
            const angleBuffer = 0.1;
            // Use provided param or default to random
            const aParam = angleParam !== undefined && angleParam !== null ? angleParam : Math.random();
            const angle = startAngle + angleBuffer + aParam * (endAngle - startAngle - 2 * angleBuffer);

            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle)
            };
        };

        // Helper to constrain a node to its quadrant/ring
        const constrainNode = (d) => {
            const dx = d.x - centerX;
            const dy = d.y - centerY;
            let angle = Math.atan2(dy, dx);
            let radius = Math.sqrt(dx * dx + dy * dy);

            if (angle < 0) angle += 2 * Math.PI;

            if (angle < 0) angle += 2 * Math.PI;

            const qIndex = getQuadrantIndex(d.quadrant);
            const rIndex = getRingIndex(d.ring);

            // Fallback to center if invalid (shouldn't happen with valid data)
            if (qIndex === -1 || rIndex === -1) return;

            const innerR = rIndex === 0 ? 0 : ringRadii[rIndex - 1];
            const outerR = ringRadii[rIndex];

            // Clamp Radius
            if (radius < innerR) radius = innerR + 5;
            if (radius > outerR) radius = outerR - 5;

            // Clamp Angle
            let startAngle, endAngle;
            switch (qIndex) {
                case 0: startAngle = Math.PI; endAngle = 1.5 * Math.PI; break;
                case 1: startAngle = 1.5 * Math.PI; endAngle = 2 * Math.PI; break;
                case 2: startAngle = 0; endAngle = 0.5 * Math.PI; break;
                case 3: startAngle = 0.5 * Math.PI; endAngle = Math.PI; break;
                default: startAngle = 0; endAngle = 2 * Math.PI;
            }

            if (qIndex === 2) {
                if (angle > 1.5 * Math.PI) angle = 0;
            }

            if (angle < startAngle) angle = startAngle + 0.05;
            if (angle > endAngle) angle = endAngle - 0.05;

            d.x = centerX + radius * Math.cos(angle);
            d.y = centerY + radius * Math.sin(angle);
        };

        // 1. Prepare Nodes
        let nodes = [];
        const isDataSame = nodesRef.current.length === data.length &&
            nodesRef.current.every((n, i) => n.id === data[i].id);

        if (isDataSame && nodesRef.current.length > 0) {
            // Reuse existing nodes
            nodes = nodesRef.current.map(n => {
                // If data has updated params, use them, otherwise keep current
                const dataItem = data.find(d => d.id === n.id);
                const aParam = dataItem.angleParam ?? n.angleParam ?? Math.random();
                const rParam = dataItem.radiusParam ?? n.radiusParam ?? Math.random();

                const coords = getCoordinates(n.quadrant, n.ring, aParam, rParam);
                return {
                    ...n,
                    angleParam: aParam,
                    radiusParam: rParam,
                    idealX: coords.x,
                    idealY: coords.y,
                    // If data params changed, update x/y to ideal, else keep current x/y
                    x: (dataItem.angleParam !== n.angleParam || dataItem.radiusParam !== n.radiusParam) ? coords.x : n.x,
                    y: (dataItem.angleParam !== n.angleParam || dataItem.radiusParam !== n.radiusParam) ? coords.y : n.y,
                };
            });
        } else {
            // New data
            nodes = data.map(item => {
                const aParam = item.angleParam ?? Math.random();
                const rParam = item.radiusParam ?? Math.random();
                const coords = getCoordinates(item.quadrant, item.ring, aParam, rParam);
                return {
                    ...item,
                    angleParam: aParam,
                    radiusParam: rParam,
                    x: coords.x,
                    y: coords.y,
                    fx: null,
                    fy: null,
                    idealX: coords.x,
                    idealY: coords.y
                };
            });
        }

        nodesRef.current = nodes;

        // 2. Run Force Simulation
        const simulation = d3.forceSimulation(nodes)
            .force("x", d3.forceX(d => d.idealX).strength(0.1))
            .force("y", d3.forceY(d => d.idealY).strength(0.1))
            .force("collide", d3.forceCollide(14).iterations(3))
            .stop();

        // 3. Manually Tick Simulation with Strict Constraints
        for (let i = 0; i < 150; ++i) {
            simulation.tick();
            nodes.forEach(constrainNode);
        }

        // Drag Behavior
        const drag = d3.drag()
            .on("start", (event, d) => {
                if (event.sourceEvent) {
                    event.sourceEvent.stopPropagation();
                    event.sourceEvent.preventDefault();
                }
                d3.select(event.sourceEvent.target).style("cursor", "grabbing");
            })
            .on("drag", (event, d) => {
                if (event.sourceEvent) {
                    event.sourceEvent.preventDefault();
                }

                // Use event.x/y directly for smoother tracking
                d.x = event.x;
                d.y = event.y;

                // Enforce constraints
                constrainNode(d);

                // Update DOM
                d3.select(event.sourceEvent.target.closest("g")).attr("transform", `translate(${d.x}, ${d.y})`);
            })
            .on("end", (event, d) => {
                d3.select(event.sourceEvent.target).style("cursor", "move");
                d.fx = d.x;
                d.fy = d.y;

                // Calculate and save new params
                const dx = d.x - centerX;
                const dy = d.y - centerY;
                let angle = Math.atan2(dy, dx);
                let radius = Math.sqrt(dx * dx + dy * dy);
                if (angle < 0) angle += 2 * Math.PI;

                if (angle < 0) angle += 2 * Math.PI;

                const qIndex = getQuadrantIndex(d.quadrant);
                const rIndex = getRingIndex(d.ring);
                if (qIndex === -1 || rIndex === -1) return; // Should not happen

                const innerR = rIndex === 0 ? 0 : ringRadii[rIndex - 1];
                const outerR = ringRadii[rIndex];

                // Calculate normalized params
                // Radius Param: 0 to 1 within the ring (accounting for buffer 0.2-0.8)
                // r = innerR + (outerR - innerR) * (0.2 + 0.6 * rParam)
                // rParam = ((r - innerR) / (outerR - innerR) - 0.2) / 0.6
                let rParam = ((radius - innerR) / (outerR - innerR) - 0.2) / 0.6;
                rParam = Math.max(0, Math.min(1, rParam)); // Clamp 0-1

                // Angle Param
                let startAngle, endAngle;
                switch (qIndex) {
                    case 0: startAngle = Math.PI; endAngle = 1.5 * Math.PI; break;
                    case 1: startAngle = 1.5 * Math.PI; endAngle = 2 * Math.PI; break;
                    case 2: startAngle = 0; endAngle = 0.5 * Math.PI; break;
                    case 3: startAngle = 0.5 * Math.PI; endAngle = Math.PI; break;
                    default: startAngle = 0; endAngle = 2 * Math.PI;
                }

                // Special case for Platformlar wrap-around
                if (qIndex === 2 && angle > 1.5 * Math.PI) angle = 0;

                const angleBuffer = 0.1;
                // angle = startAngle + angleBuffer + aParam * (endAngle - startAngle - 2 * angleBuffer)
                // aParam = (angle - startAngle - angleBuffer) / (endAngle - startAngle - 2 * angleBuffer)
                let aParam = (angle - startAngle - angleBuffer) / (endAngle - startAngle - 2 * angleBuffer);
                aParam = Math.max(0, Math.min(1, aParam)); // Clamp 0-1

                // Update local node state
                d.angleParam = aParam;
                d.radiusParam = rParam;

                // Trigger callback to save
                if (onUpdateRef.current) {
                    onUpdateRef.current(d.id, { angleParam: aParam, radiusParam: rParam });
                }
            });

        // 4. Render Blips
        nodes.forEach(item => {
            const g = svg.append("g")
                .datum(item)
                .attr("transform", `translate(${item.x}, ${item.y})`)
                .style("cursor", isDraggable ? "move" : "default")
                .on("mouseover", (event) => {
                    event.stopPropagation(); // Prevent bubbling to background

                    // Reset previous if different
                    if (activeNodeRef.current && activeNodeRef.current !== event.currentTarget) {
                        d3.select(activeNodeRef.current).select("circle").attr("r", 6).attr("stroke", "white");
                    }

                    activeNodeRef.current = event.currentTarget;
                    d3.select(event.currentTarget).select("circle").attr("r", 10).attr("stroke", "var(--accent-primary)");

                    if (onHoverRef.current) onHoverRef.current(item);
                })
                .on("mouseout", (event) => {
                    // Optional: we can rely on background hover, but keeping this for immediate feedback
                    // d3.select(event.currentTarget).select("circle").attr("r", 6).attr("stroke", "white");
                    // if (onHoverRef.current) onHoverRef.current(null);
                    // activeNodeRef.current = null;
                });

            if (isDraggable) {
                g.call(drag);
            }

            // Blip Circle
            g.append("circle")
                .attr("r", 6)
                .attr("fill", ringColors[rings.indexOf(item.ring)])
                .attr("stroke", "white")
                .attr("stroke-width", 1);

            // Attribute Indicators
            const s1 = settings?.status1 || 'Yeni';
            const s2 = settings?.status2 || 'Halka Atladı';
            const s3 = settings?.status3 || 'Halka Düştü';
            // s4 is 'Değişiklik Yok' - usually no icon

            if (item.attribute === s1) {
                g.append("circle")
                    .attr("r", 9)
                    .attr("fill", "none")
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);
            } else if (item.attribute === s2) {
                const arc = d3.arc()
                    .innerRadius(8)
                    .outerRadius(9)
                    .startAngle(-Math.PI / 2)
                    .endAngle(Math.PI / 2);

                g.append("path")
                    .attr("d", arc)
                    .attr("fill", "white");
            } else if (item.attribute === s3) {
                const arc = d3.arc()
                    .innerRadius(8)
                    .outerRadius(9)
                    .startAngle(Math.PI / 2)
                    .endAngle(3 * Math.PI / 2);

                g.append("path")
                    .attr("d", arc)
                    .attr("fill", "white");
            }

            g.append("text")
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .attr("fill", "rgba(255,255,255,0.7)")
                .style("font-size", "10px")
                .style("pointer-events", "none")
                .text(item.name.length > 10 ? item.name.substring(0, 8) + '..' : item.name);
        });

    }, [data, width, height, colors, settings]);

    return <svg ref={svgRef} width={width} height={height} style={{ touchAction: 'none' }} />;
};

export default Radar;
