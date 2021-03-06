/** convert an add trip pattern modification to r5 format */

import getStops from '../get-stops'
import getHopTimes from '../get-hop-times'
import {getExactTimesFirstDepartures} from '../timetable'

export default function convertAddTripPattern ({
  bidirectional,
  segments,
  timetables
}) {
  const segmentStops = getStops(segments)
  const stops = segmentStops.map(stop => {
    // already feed scoped
    if (stop.stopId != null) {
      return {id: stop.stopId}
    } else {
      return {
        lat: stop.lat,
        lon: stop.lon
      }
    }
  })

  const frequencies = timetables.map(tt => {
    const {
      dwellTime,
      dwellTimes,
      startTime,
      endTime,
      headwaySecs,
      exactTimes,
      segmentSpeeds,
      phaseAtStop,
      phaseFromStop,
      phaseFromTimetable,
      phaseSeconds,
      id,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    } = tt

    const days = {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    }

    let realStopIndex = 0
    const allDwellTimes = segmentStops.map(stop => {
      if (stop.autoCreated || !dwellTimes) return dwellTime
      const specificDwellTime = parseInt(dwellTimes[realStopIndex++])
      return isNaN(specificDwellTime) ? dwellTime : specificDwellTime
    })

    const hopTimes = getHopTimes(segmentStops, segmentSpeeds)
    if (exactTimes) {
      const firstDepartures = getExactTimesFirstDepartures(tt)
      return {
        ...days,
        hopTimes,
        dwellTimes: allDwellTimes,
        firstDepartures,
        entryId: id
      }
    } else {
      // include phasing information only if phaseAtStop is specified.
      // When clearing phasing, only the phaseAtStop is cleared.
      const phasing = phaseAtStop != null
        ? {
          phaseAtStop,
          phaseFromStop,
          phaseFromTimetable: phaseFromTimetable &&
              phaseFromTimetable.length > 0
              ? phaseFromTimetable.split(':')[1]
              : phaseFromTimetable,
          phaseSeconds
        }
        : {}

      return {
        ...days,
        hopTimes,
        dwellTimes: allDwellTimes,
        startTime,
        endTime,
        headwaySecs,
        entryId: id,
        ...phasing
      }
    }
  })

  return {
    bidirectional,
    frequencies,
    stops,
    type: 'add-trips'
  }
}
