import React, {Fragment, useMemo} from 'react';
import {useLocation} from "react-router-dom";
import portfolios from "../../../data/portfolio";
import SideHeader from "../../../components/SideHeader";
import Header from "../../../components/header/HeaderOne";
import FooterThree from "../../../components/footer/FooterThree";
import TemplatePortfolioDetails from "../../../templates/portfolio/details";

function useQuery() {
    const {search} = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}

const PortfolioDetailsPage = () => {
    const query = useQuery()
    const id = query.get("id");
    const portfolio = portfolios?.find(portfolio => portfolio.id === parseInt(id, 10));

    return (
        <Fragment>
            <Header classes={'position-static'}/>
            <SideHeader mobile={true}/>
            <TemplatePortfolioDetails portfolio={portfolio}/>
            <FooterThree position='fixed'/>
        </Fragment>
    );
};

export default PortfolioDetailsPage;