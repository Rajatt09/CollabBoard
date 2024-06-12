import Card from "react-bootstrap/Card";

function Footer() {
  return (
    <Card
      className="footer-card"
      style={{
        fontFamily: "Open Sans",
        color: "var(--sec)",
        alignItems: "center",
        borderStyle: "none",
        borderRadius: "0",
        width: "100%",

        backgroundColor: "rgba(227, 243, 246)",
        // marginTop: "35px",
        padding: "none !important",
      }}
    >
      <Card.Body>
        &copy; {new Date().getFullYear()} Copyright:{" "}
        <a className="text-dark" href="#">
          To be decided
        </a>
      </Card.Body>
    </Card>
  );
}

export default Footer;
