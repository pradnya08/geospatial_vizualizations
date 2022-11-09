
function simulate(data,svg)
{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

   //calculate degree of the nodes:
    let node_degree={}; //initiate an object
   d3.map(data.links, (d)=>{
       if(d.source in node_degree)
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(d.target in node_degree)
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })
   console.log(data)

    const scale_radius = d3.scaleSqrt()
        .domain(d3.extent(Object.values(node_degree)))
        .range([5,15])

    const color = d3.scaleSequential()
            .domain([1995, 2020])
            .interpolator(d3.interpolateViridis)
    const link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")

    const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){return "yr_"+d.Year.toString()})
        .on("mouseenter",function (d,data){
            node_elements.classed("inactive",true)
            d3.selectAll(".yr_"+data.Year.toString()).classed("inactive",false)
        })
        .on("mouseleave", (d,data)=>{
            d3.selectAll(".inactive").classed("inactive",false)
        })
    node_elements.append("circle")
        .attr("r",  (d,i)=>{
            if (node_degree[d.id] !== undefined) {
                return scale_radius(node_degree[d.id])
            } else {
                return scale_radius(0)
            }
        })
        .attr("fill",  d=> color(d.Year))

    node_elements.append("text")
        .attr("class","label")
        .attr("text-anchor","middle")
        .text(d=>d.name)

    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius((d,i)=>{return scale_radius(node_degree[d.id])*2}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=>d.id)
        )
        .on("tick", ticked);

    function ticked()
    {
    node_elements
        .attr('transform', (d)=>`translate(${d.x},${d.y})`)
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)

        }

    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }




}
