// @flow
import lonlat from '@conveyal/lonlat'
import {Browser, LatLngBounds} from 'leaflet'
import React, {Component} from 'react'
import {Map as LeafletMap, TileLayer} from 'react-leaflet'

import {Button} from './buttons'
import {
  EDIT_PROJECT_BOUNDS_COMPONENT,
  ISOCHRONE_COMPONENT,
  OPPORTUNITY_COMPONENT,
  REGIONAL_COMPONENT,
  EDIT_REGIONAL_ANALYSIS_BOUNDS_COMPONENT,
  DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT,
  AGGREGATION_AREA_COMPONENT,
  REGIONAL_ANALYSIS_SAMPLING_DISTRIBUTION_COMPONENT
} from '../constants/map'
import EditProjectBounds from '../containers/edit-project-bounds'
import EditRegionalAnalysisBounds
  from '../containers/edit-regional-analysis-bounds'
import Modal, {ModalBody, ModalTitle} from './modal'
import ScenarioMap from '../containers/scenario-map'
import Isochrone from '../containers/isochrone'
import Regional from '../containers/regional-layer'
import Sidebar from './sidebar'
import DestinationTravelTimeDistribution
  from '../containers/destination-travel-time-distribution'
import AggregationArea from '../containers/aggregation-area'
import RegionalAnalysisSamplingDistribution
  from '../containers/regional-analysis-sampling-distribution'

import OpportunityDatasets from '../modules/opportunity-datasets'

import type {Feature, LonLat} from '../types'

// prefer to use canvas for rendering, improves speed significantly
// http://leafletjs.com/reference.html#global
// with this on we might be able to get rid of the stop layer
window.L_PREFER_CANVAS = true

type DefaultProps = {
  variants: string[]
}

type Props = {
  bundleId: string,
  children: any,

  // actions
  clearError: () => void,
  loadProject(id: string): void,
  push(string): void,
  setMapCenter(LonLat): void,

  // state
  analysisMode: boolean,
  center: LonLat,
  error: string,
  errorMessage: string,
  hasError: boolean,
  hasScenario: boolean,
  location: {
    pathname: string
  },
  mapComponents: any[],
  modificationBounds: LatLngBounds,
  projectId?: string,
  outstandingRequests: number,
  scenarioId?: string,
  scenarioIsLoaded: boolean,
  username: string,
  zoom: number
}

type State = {
  center: {lon: number, lat: number},
  zoom: number
}

const TILE_URL = Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

export default class Application extends Component<DefaultProps, Props, State> {
  static defaultProps = {
    variants: ['Default']
  }

  state = {
    center: this.props.center,
    zoom: this.props.zoom
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!lonlat.isEqual(nextProps.center, this.props.center)) {
      this.setState({
        center: nextProps.center
      })
    }

    if (nextProps.projectId && this.props.projectId !== nextProps.projectId) {
      this.props.loadProject(nextProps.projectId)
    }
  }

  componentDidMount () {
    if (document.body) {
      document.body.classList.add('Editor')
    }

    const {loadProject, projectId} = this.props
    if (projectId) {
      loadProject(projectId)
    }
  }

  componentWillUnmount () {
    if (document.body) {
      document.body.classList.remove('Editor')
    }
  }

  _setMapCenter = (feature: Feature) => {
    this.props.setMapCenter(lonlat(feature.geometry.coordinates))
  }

  render () {
    const {
      analysisMode,
      clearError,
      children,
      error,
      errorMessage,
      hasError,
      hasScenario,
      location,
      mapComponents,
      modificationBounds,
      outstandingRequests,
      projectId,
      scenarioId,
      scenarioIsLoaded,
      username
    } = this.props
    const {center} = this.state

    return (
      <div id='editor'>
        <Sidebar
          currentPath={location.pathname}
          outstandingRequests={outstandingRequests}
          projectId={projectId}
          scenarioId={scenarioId}
          username={username}
        />
        {hasError &&
          <UiLock
            clearError={clearError}
            error={error}
            errorMessage={errorMessage}
          />}

        <div
          className={`Fullscreen ${analysisMode ? 'analysisMode' : ''}`}
        >
          <LeafletMap bounds={modificationBounds} center={center} zoom={12}>
            <TileLayer
              url={TILE_URL}
              attribution={process.env.LEAFLET_ATTRIBUTION}
              zIndex={-10}
            />

            {mapComponents.map((type, i) => {
              switch (type) {
                case EDIT_PROJECT_BOUNDS_COMPONENT:
                  return (
                    <EditProjectBounds
                      key={`map-component-${i}`}
                      projectId={projectId}
                    />
                  )
                case ISOCHRONE_COMPONENT:
                  return <Isochrone zIndex={30} key={`map-component-${i}`} />
                case OPPORTUNITY_COMPONENT:
                  return <OpportunityDatasets.components.DotMap key={`map-component-${i}`} />
                case REGIONAL_COMPONENT:
                  return <Regional key={`map-component-${i}`} />
                case EDIT_REGIONAL_ANALYSIS_BOUNDS_COMPONENT:
                  return (
                    <EditRegionalAnalysisBounds key={`map-component-${i}`} />
                  )
                case DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT:
                  return (
                    <DestinationTravelTimeDistribution
                      key={`map-component-${i}`}
                    />
                  )
                case AGGREGATION_AREA_COMPONENT:
                  return <AggregationArea key={`map-component-${i}`} />
                case REGIONAL_ANALYSIS_SAMPLING_DISTRIBUTION_COMPONENT:
                  return (
                    <RegionalAnalysisSamplingDistribution
                      key={`map-component-${i}`}
                    />
                  )
              }
            })}

            {process.env.LABEL_TILE_URL &&
              <TileLayer
                zIndex={40}
                url={
                  Browser.retina && process.env.LABEL_RETINA_URL
                    ? process.env.LABEL_RETINA_URL
                    : process.env.LABEL_TILE_URL
                }
              />}

            {/* Scenario should go on top of labels */}
            {hasScenario && scenarioIsLoaded && <ScenarioMap zIndex={50} />}
          </LeafletMap>
        </div>

        <div
          className={`ApplicationDock ${analysisMode ? 'analysisMode' : ''}`}
        >
          {children}
        </div>
      </div>
    )
  }
}

function UiLock ({clearError, error, errorMessage}) {
  return (
    <Modal onRequestClose={clearError}>
      <ModalTitle>
        Oh no! Looks like an error has occured.
      </ModalTitle>
      <ModalBody>
        <p>
          To submit an error report email a screenshot of your browser window and a description of what you were doing to
          {' '}
          <a href='mailto:analysis@conveyal.com' title='Conveyal Support'>
            analysis@conveyal.com
          </a>
        </p>
        <ul>
          <li>
            <a href='https://support.apple.com/en-us/HT201361' target='_blank'>
              How to take a screenshot on a Mac
            </a>
          </li>
          <li>
            <a
              href='https://www.howtogeek.com/226280/how-to-take-screenshots-in-windows-10/'
              target='_blank'
            >
              How to take a screenshot on a PC
            </a>
          </li>
        </ul>
      </ModalBody>
      <ModalTitle>
        {error}
      </ModalTitle>
      <ModalBody>
        <pre
          dangerouslySetInnerHTML={{
            __html: errorMessage
          }}
        />
        <p>
          <Button
            block
            onClick={() => {
              clearError()
              window.history.back()
            }}
            style='danger'
          >
            Go back
          </Button>
        </p>
      </ModalBody>
    </Modal>
  )
}
