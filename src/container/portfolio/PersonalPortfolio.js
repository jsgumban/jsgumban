import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import SectionTitle from "../../components/SectionTitle";
import Portfolio from "../../components/portfolio";
import portfolios from '../../data/portfolio/index';

const PersonalPortfolio = () => {
    return (
      <div className="bg-grey-dark section pt-120 pt-lg-80 pt-md-80 pt-sm-80 pt-xs-50 pb-120 pb-lg-80 pb-md-80 pb-sm-80 pb-xs-50">
            <Container>
                <Row>
                    <Col>
                        <SectionTitle
                            title={'Web Development Projects'}
                            content={`I have been working on I.T. industry as a full-stack web developer for about ${new Date().getFullYear() - 2016} years now.`}
                        />
                    </Col>
                </Row>

                <Row className={'portfolio-column-four mbn-30'}>
                    {portfolios.slice(0, 9).map(portfolio => (
                        <Col key={portfolio.id} lg={4} md={6} className={'mb-30'}>
                            <Portfolio
                                id={portfolio.id}
                                title={portfolio.title}
                                thumb={portfolio.thumb}
                                category={portfolio.category}
                                variant={'column'}
                            />
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default PersonalPortfolio;