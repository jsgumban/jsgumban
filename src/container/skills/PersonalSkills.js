import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import SectionTitle from "../../components/SectionTitle";
import Portfolio from "../../components/portfolio";
import skills from '../../data/skills/index'

const PersonalSkills = () => {
    return (
        <div className="bg-white section pt-120 pt-lg-80 pt-md-80 pt-sm-80 pt-xs-50 pb-120 pb-lg-80 pb-md-80 pb-sm-80 pb-xs-50">
            <Container>
                <Row>
                    <Col>
                        <SectionTitle
                            title={'Skills and Technologies'}
                        />
                    </Col>
                </Row>
    
                <Row className={'row-7 portfolio-column-four masonry-grid'}>
                    {skills.map(skill => (
                      <Col key={skill.id} md={6} lg={4} xl={3} className={'mb-15'}>
                          <Portfolio
                            id={skill.id}
                            variant={'column'}
                            title={skill.title}
                            category={skill.category}
                            thumb={skill.thumb}
                            hideLink={true}
                          />
                      </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default PersonalSkills;