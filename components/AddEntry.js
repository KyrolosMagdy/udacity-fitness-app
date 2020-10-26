import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet
} from "react-native";
import {
  getMetricMetaInfo,
  timeToString,
  getDailyReminderValue
} from "../utils/helpers";
import UdaciSteppers from "./UdaciSteppers";
import UdaciSlider from "./UdaciSlider";
import DateHeader from "./DateHeader";
import { Ionicons } from "@expo/vector-icons";
import TextButton from "./TextButton";
import { submitEntry, removeEntry } from "../utils/api";
import { connect } from "react-redux";
import { addEntry } from "../actions";
import { white, purple } from "../utils/colors";

const SubmitBtn = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={
        Platform.OS === "ios"
          ? styles.iosSubmitButton
          : styles.androidSubmitButon
      }
    >
      <Text style={styles.submitBtnText}> Submit</Text>
    </TouchableOpacity>
  );
};

const AddEntry = ({ dispatch, alreadyLogged }) => {
  const [run, setRun] = useState(0);
  const [bike, setBike] = useState(0);
  const [swim, setSwim] = useState(0);
  const [eat, setEat] = useState(0);
  const [sleep, setSleep] = useState(0);

  const biggerThanTheMax = (value, metric) => {
    const { max } = getMetricMetaInfo(metric);
    return value > max ? true : false;
  };

  const increment = metric => {
    const { max, step } = getMetricMetaInfo(metric);

    switch (metric) {
      case "run":
        return biggerThanTheMax(run + step, metric)
          ? setRun(max)
          : setRun(run + step);
      case "bike":
        return biggerThanTheMax(bike + step, metric)
          ? setBike(max)
          : setBike(bike + step);
      case "swim":
        return biggerThanTheMax(swim + step, metric)
          ? setSwim(max)
          : setSwim(swim + step);
        setSwim(swim + step);

      default:
        return;
    }
  };

  const decrement = metric => {
    const { step } = getMetricMetaInfo(metric);

    switch (metric) {
      case "run":
        return run - step < 0 ? setRun(0) : setRun(run - step);
      case "bike":
        return bike - step < 0 ? setBike(0) : setBike(bike - step);
      case "swim":
        return swim - step < 0 ? setSwim(0) : setSwim(swim - step);

      default:
        return;
    }
  };

  const submit = () => {
    const key = timeToString();
    const entry = {
      run,
      bike,
      swim,
      eat,
      sleep
    };

    clearImmediate;

    Promise.all([
      setRun(0),
      setBike(0),
      setSwim(0),
      setEat(0),
      setSleep(0)
    ]).then(() =>
      dispatch(
        addEntry({
          [key]: entry
        })
      )
    );

    // update redux
    //navigate to home

    //save to DB
    submitEntry(key, entry);

    //clear local notification
  };

  const slide = (metric, value) => {
    switch (metric) {
      case "sleep":
        return setSleep(value);
      case "eat":
        return setEat(value);

      default:
        return;
    }
  };

  const metaInfo = getMetricMetaInfo();

  const reset = () => {
    const key = timeToString();

    //update to redux
    dispatch(
      addEntry({
        [key]: getDailyReminderValue()
      })
    );

    //route to home

    //update DB
    removeEntry(key);
  };

  if (alreadyLogged) {
    return (
      <View style={styles.center}>
        <Ionicons
          name={Platform.OS === "ios" ? "ios-happy" : "md-happy"}
          size={100}
        />
        <Text> You already Logged Your information for today</Text>
        <TextButton onPress={reset} style={{ padding: 10 }}>
          {" "}
          Reset{" "}
        </TextButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DateHeader date={new Date().toLocaleDateString()} />
      {Object.keys(metaInfo).map(key => {
        const { getIcon, type, ...rest } = metaInfo[key];

        return (
          <View key={key} style={styles.row}>
            {getIcon()}
            {type === "slider" ? (
              <UdaciSlider
                value={key === "sleep" ? sleep : eat}
                onChange={e =>
                  key === "sleep" ? slide(key, e) : slide(key, e)
                }
                {...rest}
              />
            ) : (
              <UdaciSteppers
                value={key === "run" ? run : key === "bike" ? bike : swim}
                onIncrement={() => increment(key)}
                onDecrement={() => decrement(key)}
                {...rest}
              />
            )}
          </View>
        );
      })}
      <SubmitBtn onPress={submit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: white
  },
  row: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center"
  },
  iosSubmitButton: {
    backgroundColor: purple,
    padding: 10,
    borderRadius: 7,
    height: 45,
    marginLeft: 40,
    marginRight: 40
  },
  androidSubmitButon: {
    backgroundColor: purple,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    height: 45,
    borderRadius: 2,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center"
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: "center"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 30,
    marginLeft: 30
  }
});

const mapStateToProps = state => {
  const key = timeToString();

  return {
    alreadyLogged: state[key] && typeof state[key].today === "undefined"
  };
};

export default connect(mapStateToProps)(AddEntry);
