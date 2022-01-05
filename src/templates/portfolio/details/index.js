import React from 'react';
import PropTypes from "prop-types";
import {Container, Row, Col} from 'react-bootstrap';
import PageContainer from "../../../container/CustomPage";
import PortfolioDetailsThumb from "./thumbnail";
import PortfolioDetailsContent from "./content";

const TemplatePortfolioDetails = ({portfolio}) => {
    return (
        <PageContainer classes={'bg-grey'}>
            <Container>
                <Row>
                    <Col lg={7}>
                        <PortfolioDetailsThumb images={portfolio?.previewImages}/>
                    </Col>

                    <Col lg={5}>
                        <PortfolioDetailsContent
                            title={portfolio?.title}
                            category={portfolio?.category}
                            description={portfolio?.description}
                            meta={portfolio?.meta}
                        />
                    </Col>
                </Row>
            </Container>
        </PageContainer>
    );
};

TemplatePortfolioDetails.propTypes = {
    portfolio: PropTypes.object.isRequired,
};

export default TemplatePortfolioDetails;