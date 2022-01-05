import React from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import Form from "../../components/form";
import QuickContact from "../../components/QuickContact";
import Map from "../../components/map";

const Contact = () => {
    return (
        <div className="bg-grey section ">
            <div
                className="section-wrap section pt-120 pt-lg-80 pt-md-80 pt-sm-80 pt-xs-50 pb-120 pb-lg-80 pb-md-80 pb-sm-80 pb-xs-50">
                <Container>
                    <Row>
                        <Col lg={6} className={'mb-sm-45 mb-xs-45'}>
                            <Row>
                                <Col lg={10} className={'mb-45'}>
                                    <div className="contact-form">
                                        <h3>CONTACT FORM</h3>
                                        <Form/>
                                    </div>
                                </Col>

                                <Col lg={10}>
                                    <QuickContact
                                        phone={'+639770985827'}
                                        email={'gumban.johnhel@gmail.com'}
                                        location={'Davao City, Philippines'}
                                        linkedIn={'https://www.linkedin.com/in/jsgumban/'}
                                    />
                                </Col>
                            </Row>
                        </Col>

                        <Col lg={6}>
                            <Map
                                text={'Davao City, on the southern Philippine island of Mindanao, is a coastal commercial center near 2,954m-high Mount Apo, the country’s highest peak. It\'s also home to Durian Dome, named after the pungent, spiky fruit that grows in abundance on Mindanao. The Davao River cuts through the city.'}
                                lat={7.1907}
                                long={125.4553}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default Contact;