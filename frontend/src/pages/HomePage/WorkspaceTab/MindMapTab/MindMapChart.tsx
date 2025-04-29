import { FC, useEffect, useRef } from "react";
import * as d3 from "d3";
import { FiPlus, FiMinus } from "react-icons/fi";
import { MindmapNode } from ".";

type MindMapProps = {
  data: MindmapNode;
};

const MindMap: FC<MindMapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gGroupRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const gGroup = svg.append("g");
    gGroupRef.current = gGroup.node();

    // Set up zoom but disable scroll zooming
    const zoom: any = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", ({ transform }) => {
        gGroup.attr("transform", transform.toString());
      });

    svg.call(zoom).on("wheel.zoom", null); // remove zoom on scroll
    zoomRef.current = zoom;

    const root = d3.hierarchy(data);
    const nodes = root.descendants();
    const links = root.links();

    nodes.forEach((d) => {
      d.x = width / 2 + Math.random() * 100 - 50;
      d.y = height / 2 + Math.random() * 100 - 50;
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id || d.data.name)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    const link = gGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#ccc");

    const node = gGroup
      .selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => (d.depth === 0 ? "#00a63e" : "#e17100"))
      .attr("stroke", (d) => {
        const fillColor = d.depth === 0 ? "#00a63e" : "#e17100";
        return d3.color(fillColor)?.brighter(1.5)?.formatHex() || "#eee";
      })
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("r", 14);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 10);
      });

    const labelGroup = node
      .append("g")
      .style("pointer-events", "none")
      .style("opacity", 0);

    labelGroup
      .append("rect")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "white")
      .attr("stroke", "#7dd3fc")
      .attr("stroke-width", 1);

    // const text = labelGroup
    //   .append("text")
    //   .text((d) => d.data.name)
    //   .attr("x", 0)
    //   .attr("y", -18)
    //   .style("font-size", "12px")
    //   .style("font-family", "sans-serif")
    //   .style("text-anchor", "middle")
    //   .style("fill", "#000");

    node.each(function () {
      const textEl = d3.select(this).select("text").node() as SVGTextElement;
      const bbox = textEl.getBBox();
      d3.select(this)
        .select("rect")
        .attr("x", bbox.x - 6)
        .attr("y", bbox.y - 6)
        .attr("width", bbox.width + 12)
        .attr("height", bbox.height + 12);
    });

    node
      .on("mouseover", function () {
        d3.select(this).select("g").style("opacity", 1);
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 14);
      })
      .on("mouseout", function () {
        d3.select(this).select("g").style("opacity", 0);
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 10);
      });

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }
  }, []);

  const handleZoom = (scaleBy: number) => {
    const svg = d3.select(svgRef.current);
    const zoom: any = zoomRef.current;
    if (!zoom) return;

    svg
      .transition()
      .duration(500)
      .call(zoom.scaleBy, scaleBy, [
        svgRef.current!.clientWidth / 2,
        svgRef.current!.clientHeight / 2,
      ]);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "50vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      <div className="absolute top-10 right-10 flex z-50 flex-col border border-gray-200 shadow">
        <button
          onClick={() => handleZoom(1.2)}
          className="border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-100"
        >
          <FiPlus />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 cursor-pointer hover:bg-gray-100"
        >
          <FiMinus />
        </button>
      </div>
    </div>
  );
};

export default MindMap;
