import React from 'react';

// File imported
import Header from "../../../components/header/HeaderOne";
import SideHeader from "../../../components/SideHeader";
import BannerPersonalPortfolio from "../../../components/HeroBanner/PersonalPortfolio";
import PersonalPortfolio from "../../../container/portfolio/PersonalPortfolio";
import PersonalPortfolioService from "../../../container/service";
import Contact from "../../../container/contact";
import Footer from "../../../components/footer/FooterThree";
import PersonalSkills from "../../../container/skills/PersonalSkills";

const HomePersonalPortfolio = () => {
	return (
		<div className={'main-wrapper p-0'}>
			<Header classes={'position-static'}/>
			<SideHeader mobile={true}/>
			<BannerPersonalPortfolio/>
			<PersonalPortfolioService/>
			<PersonalPortfolio/>
			<PersonalSkills/>
			<Contact/>
			<Footer position={'static'}/>
		</div>
	);
};

export default HomePersonalPortfolio;
