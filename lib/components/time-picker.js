// @flow
import PropTypes from 'prop-types'
import React, {Component} from 'react'

import {Text} from './input'
import {secondsToHhMmString} from '../utils/time'

const preventDefaultIfFocused = e => {
  // http://stackoverflow.com/questions/17614844
  if (e.target === document.activeElement) e.preventDefault()
}

/** Choose hours of day, using seconds since midnight */
export default class TimePicker extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }

  _setTime = (e: Event & {target: HTMLInputElement}) => {
    const timeSplit = e.target.value.split(':')
    const time = Number(timeSplit[0]) * 3600 + Number(timeSplit[1]) * 60
    this.props.onChange(time)
  }

  render () {
    const {value, ...rest} = this.props
    return (
      <Text
        type='time'
        // http://stackoverflow.com/questions/9712295
        onWheel={preventDefaultIfFocused}
        value={secondsToHhMmString(value)}
        {...rest}
        onChange={this._setTime}
        units='hh:mm'
      />
    )
  }
}
