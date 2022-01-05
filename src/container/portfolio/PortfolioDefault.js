import React, {useRef, useImperativeHandle, forwardRef} from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import Portfolio from "../../components/portfolio";
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.scss'
import portfolioData from '../../data/portfolio'


let PortfolioDefault = (props, ref) => {
    const slider = useRef(null);

    useImperativeHandle(ref, () => ({
        slickNext: () => {
            slider.current.slickNext();
        },
        slickPrev: () => {
            slider.current.slickPrev();
        }
    }));

    const carouselSettings = {
        arrows: false,
        autoplay: false,
        autoplaySpeed: 5000,
        dots: false,
        pauseOnFocus: false,
        pauseOnHover: false,
        infinite: true,
        slidesToShow: 4 ,
        responsive: [
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                    autoplay: true,
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 2,
                    autoplay: true,
                }
            },
            {
                breakpoint: 479,
                settings: {
                    slidesToShow: 1,
                    autoplay: true,
                }
            }
        ]
    };

    return (
        <div className="content-body section">
            <div className="section-wrap section">
                <Container fluid>
                    <Row>
                        <Col className={'p-0'}>
                            <Slider ref={slider} {...carouselSettings}>
                                {portfolioData.slice(0, 5).map(portfolio => (
                                    <div key={portfolio.id} className="col pl-5 pr-5">
                                        <Portfolio
                                            id={portfolio.id}
                                            title={portfolio.title}
                                            thumb={"long-" + portfolio.thumb}
                                            category={portfolio.category}
                                            classes={'portfolio-screen-height'}
                                        />
                                    </div>
                                ))}
                            </Slider>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default forwardRef(PortfolioDefault);
