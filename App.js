import * as React from "react";
import { View } from "react-native";
import AddEntry from "./components/AddEntry";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./reducers";
// You can import from local files
import History from "./components/History"

export default function App() {
  const store = createStore(reducer);
  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <View style={{ height: 20}} />
        <History />
        
        
      </View>
    </Provider>
  );
}
