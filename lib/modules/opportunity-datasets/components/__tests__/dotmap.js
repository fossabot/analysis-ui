// @flow
import React from 'react'
import {Map} from 'react-leaflet'

import {mockWithProvider} from '../../../../utils/mock-data'
import Dotmap from '../dotmap'

const {describe, expect, it} = global
describe('Opportunity Datasets > Components > Dotmap', () => {
  it('should render', () => {
    const {snapshot} = mockWithProvider(<Map><Dotmap /></Map>)
    expect(snapshot()).toMatchSnapshot()
  })
})
