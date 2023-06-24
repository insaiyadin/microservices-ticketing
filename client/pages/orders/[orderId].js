import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Zamówienie wygasło</div>;
  }
  return (
    <div>
      Pozostały czas: {timeLeft} s
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey="pk_test_51NKbyQFnVez7BDtI4IzQNbdDhWycB0QuTAUNmfRfky32nGKX4WRumhsr8WFJ2eu9ym40JZ3FWybpOO5O4AlZHJRm00HUGDDC1z"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return {
    order: data,
  };
};

export default OrderShow;
