import { createDiscreteApi } from "naive-ui";

const { message: notify } = createDiscreteApi(["message"]);

const fetchy = $fetch.create({
  onResponse: (r) => {
    const response = r.response;
    const message = response._data?.message;
    if (!message) return;
    if (response.ok) {
      notify.success(message, { duration: 2000 });
    } else {
      notify.error(message, { duration: 5000 });
    }
  },
});

export default fetchy;
