import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"
import mapboxgl from "mapbox-gl"

import "mapbox-gl/dist/mapbox-gl.css"
import { siteMetadata } from "../../../gatsby-config"

import "./map.css"

export const Map = ({ center, zoom }) => {
  const { mapbox_api_key } = siteMetadata

  const map_node = useRef(null)
  const map_ref = useRef(null)

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

Map.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
}

Map.defaultProps = {
  center: [133.7751, -25.2744],
  zoom: 4,
}
