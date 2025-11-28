import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink, GraphType } from '../types';

interface GraphVisualizationProps {
  data: GraphData | null;
  width: number;
  height: number;
  isDark: boolean;
  graphType: GraphType;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, width, height, isDark, graphType }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Colors
  const colors = {
    concept: '#3b82f6', // blue-500
    person: '#ef4444', // red-500
    place: '#10b981', // green-500
    event: '#f59e0b', // amber-500
    other: '#8b5cf6', // violet-500
    linkLight: '#9ca3af', // gray-400
    linkDark: '#4b5563', // gray-600
    textLight: '#1f2937',
    textDark: '#f3f4f6',
  };

  useEffect(() => {
    if (!data || !svgRef.current || width === 0 || height === 0) return;

    // Clear previous graph
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Setup zoom
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Deep copy data to avoid mutating props during D3 simulation
    const nodes: GraphNode[] = data.nodes.map(d => ({ ...d }));
    const links: GraphLink[] = data.links.map(d => ({ ...d }));

    // Simulation Setup
    let simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => (d.importance * 3) + 10));

    // Apply specific forces based on GraphType
    if (graphType === GraphType.TREE || graphType === GraphType.HIERARCHICAL) {
      // Vertical hierarchy: Root at top, others below based on 'order' or 'importance'
      // If 'order' is present (1=Root), use it. Else fallback to importance (10=Root).
      simulation.force("y", d3.forceY<GraphNode>((d) => {
        if (d.order) return (d.order * 100) - (height / 2); // Spread by order
        return ((11 - d.importance) * 80) - (height / 2); // Fallback to importance
      }).strength(0.5));

      simulation.force("charge", d3.forceManyBody().strength(-600)); // Spread more
    } else if (graphType === GraphType.TIMELINE) {
      // Horizontal timeline: Left to right based on 'order'
      simulation.force("x", d3.forceX<GraphNode>((d) => {
        if (d.order) return (d.order * 150) - (width / 2);
        return 0;
      }).strength(0.8));

      // Constrain Y to keep it somewhat linear but allow wiggle
      simulation.force("y", d3.forceY(0).strength(0.1));
    } else if (graphType === GraphType.COMMUNITY) {
      // Clustering: Group by 'group' field
      simulation.force("charge", d3.forceManyBody().strength(-200));
      simulation.force("collide", d3.forceCollide<GraphNode>().radius((d) => (d.importance * 4) + 15));
      // Note: D3 doesn't have a built-in "cluster" force in basic bundle, but charge+link usually handles it.
      // We could add a custom force to pull same-group nodes together, but standard force often suffices if links are intra-cluster.
    }

    // Draw Links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.strength))
      .attr("stroke", isDark ? colors.linkDark : colors.linkLight)
      .attr("opacity", 0.6);

    // Link Labels (Relationships) - Optional: Can clutter graph, shown on hover instead?
    // Let's show them but make them small and subtle
    const linkText = g.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(links)
      .enter().append("text")
      .text(d => d.relation)
      .attr("font-size", 10)
      .attr("fill", isDark ? "#9ca3af" : "#6b7280") // gray-400/500
      .attr("text-anchor", "middle")
      .attr("opacity", 0); // Hidden by default to keep it clean, could toggle

    // Draw Nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => 8 + (d.importance * 1.5))
      .attr("fill", d => colors[d.type] || colors.other)
      .attr("stroke", isDark ? "#fff" : "#fff")
      .attr("stroke-width", 1.5)
      .attr("cursor", "grab")
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node Labels
    const label = g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("fill", isDark ? colors.textDark : colors.textLight)
      .style("pointer-events", "none")
      .style("text-shadow", isDark ? "0 1px 2px black" : "0 1px 2px white");

    // Interactivity
    node.on("mouseover", (event, d) => {
      // Highlight connected
      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(d.id);

      links.forEach(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        if (sourceId === d.id) connectedNodeIds.add(targetId as string);
        if (targetId === d.id) connectedNodeIds.add(sourceId as string);
      });

      node.attr("opacity", n => connectedNodeIds.has(n.id) ? 1 : 0.1);
      link.attr("opacity", l => {
        const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        return (sourceId === d.id || targetId === d.id) ? 1 : 0.05;
      });
      linkText.attr("opacity", l => {
        const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        return (sourceId === d.id || targetId === d.id) ? 1 : 0;
      });
      label.attr("opacity", n => connectedNodeIds.has(n.id) ? 1 : 0.1);

      setHoveredNode(d);
      setTooltipPos({ x: event.pageX, y: event.pageY });
    })
      .on("mouseout", () => {
        node.attr("opacity", 1);
        link.attr("opacity", 0.6);
        linkText.attr("opacity", 0);
        label.attr("opacity", 1);
        setHoveredNode(null);
      });

    // Tick function
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      linkText
        .attr("x", d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr("y", d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x! + 12)
        .attr("y", d => d.y! + 4);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target).attr("cursor", "grabbing");
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.target).attr("cursor", "grab");
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height, isDark]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-inner">
      <svg ref={svgRef} width={width} height={height} className="cursor-move" />

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {/* Could implement manual zoom buttons here interacting with d3.zoom identity if needed */}
        <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-xs text-gray-500 backdrop-blur-sm pointer-events-none">
          Role para Zoom • Arraste para Mover
        </div>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-50 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 pointer-events-none max-w-xs transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{
            left: Math.min(width - 320, Math.max(20, tooltipPos.x - (window.innerWidth - width) - 20)), // Adjust for sidebar offset approx
            top: Math.min(height - 150, tooltipPos.y - 120) // Position near mouse but keep in bounds
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[hoveredNode.type] || colors.other }}
            ></span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{hoveredNode.label}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">
            {hoveredNode.type.toUpperCase()}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {hoveredNode.description}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Importância: {hoveredNode.importance}/10
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 pointer-events-none">
          <span className="material-icons-round text-6xl mb-4 opacity-50">hub</span>
          <p className="text-lg">Insira um texto e gere o grafo para visualizar</p>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;