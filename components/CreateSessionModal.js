import styles from "../styles/Form.module.css";
import btnStyles from "../styles/Buttons.module.css";
import { Children, Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../config/axios";
import { categories } from "../data/categories";
import Modal from "./Modal";
import ErrorsList from "../components/ErrorsList";
import DoneSVG from "../icons/DoneSVG";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from "@material-ui/core";

const d = new Date();
const dYear = d.getFullYear();
const dMonth = d.getMonth() + 1;
const dDay = d.getDate();
const defaultDate = `${dYear}-${dMonth < 10 ? `0${dMonth}` : dMonth}-${
  dDay < 10 ? `0${dDay}` : dDay
}T00:00`;

function CreateSessionModal({ toggleModal }) {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    category_other: "",
    date_and_time: new Date(defaultDate),
  });

  // change input data
  const handleChange = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    if (name === "date_and_time") value = new Date(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    dispatch({ type: "TOAST", payload: { txt: "Sending payload...", type: "loading" } });

    try {
      const response = await Axios(token).post("/api/session/create", formData);
      dispatch({ type: "SESSION_CREATED", payload: response.data.session });
      dispatch({ type: "ACCOUNT_UPDATED", payload: response.data.account });
      dispatch({ type: "TOAST", payload: { txt: response.data.message, type: "success" } });
      setIsDone(true);
    } catch (error) {
      console.error(error.message);
      dispatch({ type: "TOAST", payload: { txt: error.message, type: "error" } });
      setErrors([error.response.data.message]);
    }

    setLoading(false);
  };

  return (
    <Modal clickClose={toggleModal}>
      <form onSubmit={handleSubmit} className={`${styles.form}`}>
        <h6 className={styles.title}>Create a Session</h6>

        {isDone ? (
          <DoneSVG />
        ) : (
          <Fragment>
            <FormControl required variant='outlined' className={styles.inp}>
              <InputLabel htmlFor='category'>Category</InputLabel>
              <Select
                id='category'
                name='category'
                value={formData["category"]}
                onChange={handleChange}
                labelWidth={70}>
                {Children.toArray(categories.map((cat) => <MenuItem value={cat}>{cat}</MenuItem>))}
              </Select>
            </FormControl>

            {formData["category"] === "Other" && (
              <TextField
                label='Other Description'
                name='category_other'
                value={formData["category_other"]}
                onChange={handleChange}
                required
                variant='outlined'
                className={styles.inp}
              />
            )}

            <TextField
              label='Date and Time'
              name='date_and_time'
              type='datetime-local'
              defaultValue={defaultDate}
              onChange={handleChange}
              required
              variant='outlined'
              className={styles.inp}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Fragment>
        )}

        {errors.length ? <ErrorsList errors={errors} /> : null}

        <div className={`${styles.btnWrap}`}>
          {loading ? (
            <CircularProgress />
          ) : isDone ? (
            <Button
              variant='contained'
              className={`${styles.btn} ${btnStyles.blueRadient}`}
              onClick={toggleModal}>
              Close
            </Button>
          ) : (
            <Button
              variant='contained'
              className={`${styles.btn} ${btnStyles.blueRadient}`}
              type='submit'>
              Submit
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default CreateSessionModal;
