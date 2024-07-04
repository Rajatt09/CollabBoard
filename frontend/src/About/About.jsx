import React from "react";
import styled, { keyframes } from "styled-components";
import {
  FiHelpCircle,
  FiPhone,
  FiMail,
  FiInfo,
  FiCalendar,
  FiMessageSquare,
  FiPenTool,
  FiFileText,
  FiTriangle,
  FiTrash2,
  FiSave,
  FiZap,
  FiVideo,
  FiUsers,
} from "react-icons/fi";
import { FaDesktop } from "react-icons/fa";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/AboutAnimation.json";

const HelpPage = () => {
  return (
    <MainHelpDiv>
      <ResponsivePlayer autoplay loop src={animationData} />
      <ResponsivePlayer1 autoplay loop src={animationData} />
      <ResponsivePlayer2 autoplay loop src={animationData} />
      <ResponsivePlayer3 autoplay loop src={animationData} />
      <Container>
        <Header>
          <Title>
            <FiHelpCircle /> Help & Support
          </Title>
          <SubTitle>
            Your guide to using the Board and Meeting features
          </SubTitle>
        </Header>
        <Content>
          <Section>
            <SectionTitle>
              <FiInfo /> About the Board
            </SectionTitle>
            <SectionContent>
              <p>
                The Board feature allows you to draw, add text, shapes, and save
                your content. You can use various tools like the pen, text tool,
                and shape tools to create and customize your whiteboard.
              </p>
              <ul>
                <li>
                  <FiPenTool /> Draw: Use the pen tool to draw on the board.
                </li>
                <li>
                  <FiFileText /> Text: Add and edit text on the board.
                </li>
                <li>
                  <FiTriangle /> Shapes: Add shapes like triangles, circles, and
                  rectangles.
                </li>
                <li>
                  <FiTrash2 /> Erase: Use the erase tool to remove elements.
                </li>
                <li>
                  <FiSave /> Save: Save your board as an image or PDF.
                </li>
                <li>
                  <FiZap /> Record: Record your board sessions and save them.
                </li>
              </ul>
            </SectionContent>
          </Section>
          <Section>
            <SectionTitle>
              <FiCalendar /> About Meetings
            </SectionTitle>
            <SectionContent>
              <p>
                The Meeting feature allows you to schedule, join, and manage
                online meetings seamlessly. You can share your screen, chat with
                participants, and collaborate in real-time.
              </p>
              <ul>
                <li>
                  <FiMessageSquare /> Chat: Communicate with participants
                  through chat.
                </li>
                <li>
                  <FiVideo /> Video: Start a video call with participants.
                </li>
                <li>
                  <FaDesktop /> Screen Share: Share your screen during the
                  meeting.
                </li>
                <li>
                  <FiUsers /> Participants: Manage participants in the meeting.
                </li>
                <li>
                  <FiCalendar /> Schedule: Schedule and manage your meetings.
                </li>
              </ul>
            </SectionContent>
          </Section>
          <ContactSection>
            <ContactTitle>Contact Us</ContactTitle>
            <ContactContent>
              <p>
                If you have any questions or need further assistance, please
                contact us:
              </p>
              <ContactInfo>
                <ContactItem>
                  <p
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {" "}
                    <FiMail /> Email
                  </p>
                  <a
                    style={{ textDecoration: "none" }}
                    href="mailto:support@example.com"
                  >
                    rajatbhati9339@example.com
                  </a>
                </ContactItem>
              </ContactInfo>
            </ContactContent>
          </ContactSection>
        </Content>
      </Container>
    </MainHelpDiv>
  );
};

const ResponsivePlayer = styled(Player)`
  height: 500px;
  width: 500px;
  position: absolute;
  top: 0;
  left: -120px;

  transform: rotate(-30deg);
  @media (max-width: 768px) {
    transform: rotate(-20deg);

    height: 100px;
    width: 100px;
  }
`;

const ResponsivePlayer1 = styled(Player)`
  height: 500px;
  width: 500px;
  position: absolute;
  top: 0px;
  right: -120px;

  transform: rotate(80deg);
  @media (max-width: 768px) {
    transform: rotate(-20deg);

    height: 100px;
    width: 100px;
  }
`;

const ResponsivePlayer2 = styled(Player)`
  height: 500px;
  width: 500px;
  position: absolute;
  bottom: 0px;
  right: -120px;

  transform: rotate(-30deg);
  @media (max-width: 768px) {
    transform: rotate(-20deg);

    height: 100px;
    width: 100px;
  }
`;

const ResponsivePlayer3 = styled(Player)`
  height: 500px;
  width: 500px;
  position: absolute;
  bottom: 0px;
  left: -120px;

  transform: rotate(80deg);
  @media (max-width: 768px) {
    transform: rotate(-20deg);

    height: 100px;
    width: 100px;
  }
`;

const MainHelpDiv = styled.div`
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  color: #333;
  position: relative;
  z-index: 500;

  padding: 20px;
  max-width: 1000px;
  margin: 80px auto 15px;
  background: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 400;
`;

const Title = styled.h1`
  font-size: 2.5em;
  color: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const SubTitle = styled.p`
  font-size: 1.2em;
  color: #666;
`;

const Content = styled.div`
  position: relative;
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Section = styled.section`
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 2em;
  color: #3f51b5;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionContent = styled.div`
  font-size: 1em;
  color: #333;

  p {
    margin: 10px 0;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
      font-size: 1em;
    }
  }
`;

const ContactSection = styled.section`
  background: #3f51b5;
  padding: 20px;
  border-radius: 10px;
  color: #fff;
`;

const ContactTitle = styled.h2`
  font-size: 2em;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
`;

const ContactContent = styled.div`
  text-align: center;

  p {
    font-size: 1.2em;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const ContactItem = styled.div`
  font-size: 1.2em;
  display: flex;
  align-items: center;
  flex-direction: column;

  a {
    color: #fff;
    text-decoration: underline;
  }
`;

export default HelpPage;
