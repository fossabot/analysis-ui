/** Aggregate accessibility for the comparison regional analysis */

import {createSelector} from 'reselect'
import {getAggregateAccessibility} from './aggregate-accessibility'

export default createSelector(
  state => state.analysis.regional.comparisonGrid,
  // aggregation area and weights don't vary between base and comparison
  state => state.analysis.regional.aggregationArea,
  state => state.analysis.regional.aggregationWeights,
  getAggregateAccessibility
)
