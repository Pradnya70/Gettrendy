import React, { useEffect } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./Videogallery.css";

const videos = [
  {
    id: 1,
    title: "KGN XPRS Restaurant",
    embedUrl: "https://www.youtube.com/embed/VjFjcpYVRHo",
  },
  {
    id: 2,
    title: "GO Pro Hero5",
    embedUrl: "https://www.instagram.com/reel/CfnuD-FDQJm",
  },
  {
    id: 3,
    title: "GO Pro Hero4",
    embedUrl: "https://www.youtube.com/embed/dYgDyvwr-fQ",
  },
];

// Utility functions
const isYouTubeUrl = (url) =>
  url.includes("youtube.com") || url.includes("youtu.be");
const isInstagramUrl = (url) => url.includes("instagram.com");

const Videogallery = () => {
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, []);

  return (
    <Container className="video-container">
      <div
        data-aos="fade-down"
        data-aos-duration="2000"
        className="section-title mb-5"
      >
        <div className="section-line"></div>
        <div className="text-center">
          <h5>Watch Our Stories</h5>
          <h1>Experience the Journey with Our Videos</h1>
        </div>
        <div className="section-line"></div>
      </div>
      <Row>
        {videos.map((video) => (
          <Col
            key={video.id}
            md={4}
            className="mb-5 d-flex justify-content-center"
          >
            <Card style={{ width: "18rem" }}>
              {isYouTubeUrl(video.embedUrl) && (
                <iframe
                  width="100%"
                  height="200px"
                  src={video.embedUrl}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              {isInstagramUrl(video.embedUrl) && (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    overflow: "hidden",
                  }}
                >
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={video.embedUrl}
                    data-instgrm-version="14"
                    style={{
                      background: "#FFF",
                      border: "none",
                      borderRadius: "3px",
                      boxShadow:
                        "0 0 1px 0 rgba(0, 0, 0, 0.5),0 1px 10px 0 rgba(0, 0, 0, 0.15)",
                      margin: "1px",
                      maxWidth: "100%",
                      width: "calc(100% - 2px)",
                      padding: "0",
                    }}
                  ></blockquote>
                </div>
              )}
              <Card.Body>
                <Card.Title>{video.title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Videogallery;
