import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>Signed in</h1> : <h1>Not signed in</h1>;
};

LandingPage.getInitialProps = async ({ req }) => {
  console.log("LANDING PAGE");
  const client = buildClient({ req });
  const { data } = await client.get("/api/users/currentuser");

  return data;
};

export default LandingPage;
