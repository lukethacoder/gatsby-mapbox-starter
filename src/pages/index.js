import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { Planes } from "../components/map"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <Planes center={[39.0742, 21.8243]} zoom={2} />
  </Layout>
)

export default IndexPage
