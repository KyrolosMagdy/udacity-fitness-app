import React, { useEffect, useState } from "react";
import { View, Text } from 'react-native';
import { connect } from "react-redux";
import {addEntry, receiveEntries} from "../actions";
import {timeToString, getDailyReminderValue} from "../utils/helpers"
import { fetchCalenderResults } from "../utils/api"
import entries from "../reducers";
import UdacityFitnessCalendar from 'udacifitness-calendar-fix'

class History extends React.Component {

  componentDidMount() {
    const {dispatch} = this.props;
     fetchCalenderResults().then((entries) => dispatch(receiveEntries(entries))).then(entries => {
      if (!entries[timeToString()]) {
        dispatch(addEntry({
          [timeToString()]: getDailyReminderValue()
        }))
      }
    })
  }

  renderItem = ({ today, ...metrics}, formatedDate, key) => (
    <View>
      {
        today? <Text> { JSON.stringify(today)}</Text> : <Text> { JSON.stringify(metrics)} </Text>
      }
    </View>
  )

  renderEmptyDate = (formatedDate) => (
    <View>
      <Text> No Data for this day</Text>
    </View>
  )
  
  render() {
    const { entries} = this.props;
      return(
  
      <UdacityFitnessCalendar items={entries} renderItem={this.renderItem} renderEmptyDate={this.renderEmptyDate} />
  
  )
  }
}


const mapStateToProps = entries => {
  return entries;
} 

export default connect(mapStateToProps)(History)