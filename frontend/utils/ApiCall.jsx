import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUserinfo } from "../utils/counterSlice.js";

async function ApiCall(url, httpMethod, data, dispatch) {
  // const dispatch = useDispatch();

  try {
    if (httpMethod === "GET") {
      const response = await axios.get(url, data);

      return response;
    } else if (httpMethod === "POST") {
      const response = await axios.post(url, data);

      return response;
    }
  } catch (error) {
    console.error("Error in API call:", error);
    if (error.response) {
      const errorMessage = error.response.data.message;
      let checkmessage;
      if (errorMessage === "Unauthorized request" || "Invalid Access Token") {
        dispatch(
          updateUserinfo({
            email: "",
            phone: "",
            joined: "",
            show: false,
          })
        );
        console.error("Error from backend:", errorMessage);
        checkmessage = errorMessage;
        // window.location.href = "/";
      }
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error:", error.message);
    }
  }
}

export default ApiCall;
