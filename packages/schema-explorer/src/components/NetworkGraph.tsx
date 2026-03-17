import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { ManabiObject, LookupRelation, Domain } from '@sf-report-tools/types';
import { DOMAIN_COLORS } from '@sf-report-tools/types';
import { useSchema } from '../context/SchemaContext';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  domain: Domain;
  fieldCount: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  field: string;
  type: LookupRelation['type'];
}

export function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state, dispatch } = useSchema();

  const buildGraphData = useCallback(() => {
    if (!state.schema) return { nodes: [], links: [] };

    const visibleSet = new Set(
      Object.values(state.schema)
        .filter((obj) => state.selectedDomains.has(obj.domain))
        .map((obj) => obj.api_name)
    );

    const nodes: GraphNode[] = Object.values(state.schema)
      .filter((obj) => visibleSet.has(obj.api_name))
      .map((obj) => ({
        id: obj.api_name,
        name: obj.name,
        domain: obj.domain,
        fieldCount: obj.fields.length,
      }));

    const links: GraphLink[] = [];
    Object.values(state.schema).forEach((obj: ManabiObject) => {
      if (!visibleSet.has(obj.api_name)) return;
      obj.lookups.forEach((lk) => {
        if (visibleSet.has(lk.target)) {
          links.push({
            source: obj.api_name,
            target: lk.target,
            field: lk.field,
            type: lk.type,
          });
        }
      });
    });

    return { nodes, links };
  }, [state.schema, state.selectedDomains]);

  useEffect(() => {
    if (!svgRef.current || !state.schema) return;
    const svg = d3.select(svgRef.current!);

    const { width, height } = svgRef.current.getBoundingClientRect();
    const { nodes, links } = buildGraphData();

    if (nodes.length === 0) {
      svg.selectAll('*').remove();
      return;
    }

    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Highlighted chain set for styling
    const chainSet = new Set(state.highlightedChain?.objects ?? []);
    const chainEdgeSet = new Set<string>();
    if (state.highlightedChain) {
      const objs = state.highlightedChain.objects;
      for (let i = 0; i < objs.length - 1; i++) {
        chainEdgeSet.add(`${objs[i]}->${objs[i + 1]}`);
        chainEdgeSet.add(`${objs[i + 1]}->${objs[i]}`);
      }
    }

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Links
    const link = g.append('g')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => {
        const sId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id;
        const tId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id;
        return chainEdgeSet.has(`${sId}->${tId}`) ? '#F59E0B' : '#E5E7EB';
      })
      .attr('stroke-width', (d) => {
        const sId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id;
        const tId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id;
        if (chainEdgeSet.has(`${sId}->${tId}`)) return 3;
        return d.type === 'MasterDetail' ? 2 : 1;
      })
      .attr('stroke-dasharray', (d) => d.type === 'Lookup' ? '4,2' : null);

    // Nodes
    const node = g.append('g')
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => Math.max(4, Math.min(12, d.fieldCount / 3)))
      .attr('fill', (d) => DOMAIN_COLORS[d.domain])
      .attr('stroke', (d) => {
        if (d.id === state.selectedObject) return '#000';
        if (chainSet.has(d.id)) return '#F59E0B';
        return '#fff';
      })
      .attr('stroke-width', (d) => {
        if (d.id === state.selectedObject) return 3;
        if (chainSet.has(d.id)) return 2;
        return 1;
      })
      .attr('cursor', 'pointer')
      .on('click', (_, d) => {
        dispatch({ type: 'SELECT_OBJECT', apiName: d.id });
      })
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Labels
    const label = g.append('g')
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(nodes)
      .join('text')
      .text((d) => d.name)
      .attr('font-size', 9)
      .attr('dx', 14)
      .attr('dy', 3)
      .attr('fill', '#374151')
      .attr('pointer-events', 'none');

    // Tooltip
    node.append('title').text((d) => `${d.name}\n(${d.id})\nFields: ${d.fieldCount}`);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
      label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [state.schema, state.selectedDomains, state.selectedObject, state.highlightedChain, buildGraphData, dispatch]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-50"
      style={{ minHeight: '400px' }}
    />
  );
}
