import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import serviceBg from '../../assets/images/bg/blog-hero.png';
import SectionTitle from "../../components/SectionTitle";
import Service from "../../components/service";
import services from '../../data/service'

const PersonalPortfolioService = () => {
    return (
        <div className="bg-grey section service-bg" style={{backgroundImage: `url(${serviceBg})`}}>
            <div className="section-wrap section pt-120 pt-lg-80 pt-md-80 pt-sm-80 pt-xs-50 pb-120 pb-lg-80 pb-md-80 pb-sm-80 pb-xs-50">
                <Container>
                    <Row>
                        <Col>
                            <SectionTitle
                                title={"RELEVANT WORK EXPERIENCES"}
                                content={"I am a graduate of Bachelor of Science in Computer Science at the University of the Philippines in 2016."}
                            />
                        </Col>
                    </Row>

                    <Row>
                        {services.map(service => (
                            <Col key={service.id} md={12} className={'mb-40 mb-xs-30'}>
                                <Service
                                    title={service.title}
                                    position={service.position}
                                    contents={service.contents}
                                />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default PersonalPortfolioService;