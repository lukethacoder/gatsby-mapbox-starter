import React, { useRef, useEffect } from "react"
import { useStaticQuery, graphql } from "gatsby"
import PropTypes from "prop-types"
import mapboxgl from "mapbox-gl"

import "mapbox-gl/dist/mapbox-gl.css"
import { siteMetadata } from "../../../gatsby-config"

import "./map.css"
import "./planes.css"

export const Planes = ({ center, zoom }) => {
  const { mapbox_api_key } = siteMetadata

  const map_node = useRef(null)
  const map_ref = useRef(null)

  const plane_img = useStaticQuery(graphql`
    query {
      image: file(relativePath: { eq: "plane.png" }) {
        childImageSharp {
          fluid(maxWidth: 20) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)
  console.log("plane_img ", plane_img)
  console.log("plane_img ", plane_img.image.childImageSharp.fluid.base64)

  useEffect(() => {
    if (!mapbox_api_key) {
      console.error(
        "Mapbox `mapbox_api_key` is required in gatsby-config.js siteMetadata"
      )
    }

    if (!(typeof window !== "undefined" && window)) {
      console.error("No window")
      return null
    }

    // Token must be set before constructing map
    mapboxgl.accessToken = mapbox_api_key

    const map = new mapboxgl.Map({
      container: map_node.current,
      style: `mapbox://styles/mapbox/dark-v10`,
      center: center,
      zoom: zoom,
    })
    map_ref.current = map
    map_ref.current = map

    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    map.on("load", () => {
      console.log("map onload")

      // get data from OpenSky API
      // https://opensky-network.org/apidoc/rest.html
      fetch(`https://opensky-network.org/api/states/all`)
        .then(response => response.json()) // parse JSON from request
        .then(resData => {
          console.log("resData ", resData)
          console.log("resData ", resData.states)

          let geo_planes = resData.states
            .map(item => {
              if (item[5] && item[6]) {
                return {
                  type: "Feature",
                  properties: {
                    C: item[2],
                    lon: item[5],
                    lat: item[6],
                    track: item[10],
                    VR: item[11],
                    ALT: item[13],
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [item[5], item[6]],
                  },
                }
              } else {
                return null
              }
            })
            .filter(item => item)
          console.log("geo_planes ", geo_planes)

          map.loadImage(plane_img.image.childImageSharp.fluid.base64, function(
            error,
            image
          ) {
            if (error) throw error
            map.addImage("plane", image)

            map.addSource("planes-data", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: geo_planes,
              },
            })

            map.addLayer({
              id: "planes-flying",
              type: "symbol",
              source: "planes-data",
              layout: {
                "icon-image": "plane",
                "icon-size": 1,
                "icon-rotate": {
                  type: "identity",
                  property: "track",
                },
                "icon-allow-overlap": true,
              },
            })

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on("mouseenter", `planes-flying`, function() {
              map.getCanvas().style.cursor = "pointer"
            })

            // Change it back to a pointer when it leaves.
            map.on("mouseleave", `planes-flying`, function() {
              map.getCanvas().style.cursor = ""
            })

            // handle user click
            map.on("click", `planes-flying`, function(e) {
              console.log("e.features", e.features)
              let properties = e.features[0].properties

              let html = `<div class="mapbox__popup_wrapper">
                    <h3>Departed from: ${properties.C}</h3>
                    <p>Altitude: ${properties.ALT}m</p>
                    <p>Vertical Rate: ${properties.VR}</p>
                  </div>`

              new mapboxgl.Popup()
                .setLngLat({
                  lon: e.lngLat.lng,
                  lat: e.lngLat.lat,
                })
                .setHTML(html)
                .addTo(map)
            })

            // map.addSource("point", {
            //   type: "geojson",
            //   data: {
            //     type: "FeatureCollection",
            //     features: [
            //       {
            //         type: "Feature",
            //         geometry: {
            //           type: "Point",
            //           coordinates: [0, 0],
            //         },
            //       },
            //     ],
            //   },
            // })
            // map.addLayer({
            //   id: "points",
            //   type: "symbol",
            //   source: "point",
            //   layout: {
            //     "icon-image": "cat",
            //     "icon-size": 0.25,
            //   },
            // })
          })
        })

      // add sources
      // Object.entries(sources).forEach(([id, source]) => {
      //   map.addSource(id, source)
      // })

      // add layers
      // layers.forEach(layer => {
      //   map.addLayer(layer)
      // })
    })

    return () => {
      map.remove()
    }
  }, [])

  return (
    <div
      style={{
        background: `#343332`,
        marginBottom: `1.45rem`,
      }}
    >
      <div className="mapbox" ref={map_node}></div>
    </div>
  )
}

Planes.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
}

Planes.defaultProps = {
  center: [133.7751, -25.2744],
  zoom: 4,
}
