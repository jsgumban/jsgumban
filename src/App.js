import React, {Fragment} from 'react';
import Switcher from "./components/Switcher";
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

/*
* @ Component Imported
* */
import TeamPage from "./pages/me/team";
import AboutPage from "./pages/me/about";
import ErrorPage from "./pages/common/not-found";
import ContactPage from "./pages/me/contact";
import ServicePage from "./pages/me/service";
import HomeBlog from "./pages/me/home/HomeBlog";
import HomeDefault from "./pages/me/home/HomeDefault";
import HomeFiveColumn from './pages/me/home/HomeFiveColumn';
import HomeFourColumn from "./pages/me/home/HomeFourColumn";
import BlogThreeColumnPage from "./pages/me/blog/ThreeColumn";
import HomeThreeColumn from "./pages/me/home/HomeThreeColumn";
import PortfolioDetailsPage from "./pages/me/portfolio/details";
import HomePersonalPortfolio from "./pages/me/home/HomePersonalPortfolio";
import HomeFreelancerPortfolio from "./pages/me/home/HomeFreelancerPortfolio";
import PortfolioGridTwoColumnPage from "./pages/me/portfolio/grid/two-column";
import BlogDetailsLeftSidebarPage from "./pages/me/blog/BlogDetailsLeftSidebar";
import BlogTwoColumnLeftSidebarPage from "./pages/me/blog/TwoColumnLeftSidebar";
import PortfolioGridFourColumnPage from "./pages/me/portfolio/grid/four-column";
import BlogDetailsWithoutSidebar from "./pages/me/blog/BlogDetailsWithoutSidebar";
import PortfolioGridThreeColumnPage from "./pages/me/portfolio/grid/three-column";
import BlogTwoColumnRightSidebarPage from "./pages/me/blog/TwoColumnRightSidebar";
import BlogDetailsRightSidebarPage from "./pages/me/blog/BlogDetailsRightSidebar";
import PortfolioMasonryTwoColumnPage from "./pages/me/portfolio/masonry/two-column";
import PortfolioMasonryFourColumnPage from "./pages/me/portfolio/masonry/four-column";
import PortfolioMasonryThreeColumnPage from "./pages/me/portfolio/masonry/three-column";
import PortfolioGridFourColumnFullWidthPage from "./pages/me/portfolio/grid/four-column-fullwidth";
import PortfolioGridFiveColumnFullWidthPage from "./pages/me/portfolio/grid/five-column-fullwidth";
import PortfolioGridThreeColumnFullWidthPage from "./pages/me/portfolio/grid/three-column-fullwidth";
import PortfolioMasonryFourColumnFullWidthPage from "./pages/me/portfolio/masonry/four-column-fullwidth";
import PortfolioMasonryFiveColumnFullWidthPage from "./pages/me/portfolio/masonry/five-column-fullwidth";
import PortfolioMasonryThreeColumnFullWidthPage from "./pages/me/portfolio/masonry/three-column-fullwidth";
import Finance from "./pages/finance";
import FlashCard from "./pages/flash-card";
import ScoutApp from "./pages/scout-app";
import BillsApp from "./pages/bills";

const App = () => {
    return (
        <Fragment>
            <Router>
                <Switch>
                    <Route path={`${process.env.PUBLIC_URL + "/portfolio/:id"}`} component={PortfolioDetailsPage}/>
                    <Route exact path={`${process.env.PUBLIC_URL + "/"}`} component={HomePersonalPortfolio}/>
                    <Route exact path={`${process.env.PUBLIC_URL + "/me"}`} component={HomePersonalPortfolio}/>
                    
                    <Route exact path={`${process.env.PUBLIC_URL + "/finance"}`} component={Finance}/>
                    <Route exact path={`${process.env.PUBLIC_URL + "/flash-card"}`} component={FlashCard}/>
    
    
                    <Route path={`${process.env.PUBLIC_URL + "/scout"}`} component={ScoutApp}/>
                    <Route path={`${process.env.PUBLIC_URL + "/bills"}`} component={BillsApp}/>
                    <Route exact component={ErrorPage}/>
                    
                    
                    {/*<Route path={`${process.env.PUBLIC_URL + "/contact"}`}*/}
                    {/*       component={ContactPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/team"}`}*/}
                    {/*       component={TeamPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/service"}`}*/}
                    {/*       component={ServicePage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/blog-details-without-sidebar"}`}*/}
                    {/*       component={BlogDetailsWithoutSidebar}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/blog-details-left-sidebar"}`}*/}
                    {/*       component={BlogDetailsLeftSidebarPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/blog-details"}`}*/}
                    {/*       component={BlogDetailsRightSidebarPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/blog-two-column-left-sidebar"}`}*/}
                    {/*       component={BlogTwoColumnLeftSidebarPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/blog-two-column-right-sidebar"}`}*/}
                    {/*       component={BlogTwoColumnRightSidebarPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/blog"}`}*/}
                    {/*       component={BlogThreeColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-five-column-fullwidth"}`}*/}
                    {/*       component={PortfolioMasonryFiveColumnFullWidthPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-four-column-fullwidth"}`}*/}
                    {/*       component={PortfolioMasonryFourColumnFullWidthPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-three-column-fullwidth"}`}*/}
                    {/*       component={PortfolioMasonryThreeColumnFullWidthPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-four-column"}`}*/}
                    {/*       component={PortfolioMasonryFourColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-three-column"}`}*/}
                    {/*       component={PortfolioMasonryThreeColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-masonry-two-column"}`}*/}
                    {/*       component={PortfolioMasonryTwoColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-grid-five-column-fullwidth"}`}*/}
                    {/*       component={PortfolioGridFiveColumnFullWidthPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-grid-four-column-fullwidth"}`}*/}
                    {/*       component={PortfolioGridFourColumnFullWidthPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-grid-three-column-fullwidth"}`}*/}
                    {/*       component={PortfolioGridThreeColumnFullWidthPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-grid-four-column"}`}*/}
                    {/*       component={PortfolioGridFourColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-grid-three-column"}`}*/}
                    {/*       component={PortfolioGridThreeColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/portfolio-grid-two-column"}`}*/}
                    {/*       component={PortfolioGridTwoColumnPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/about"}`}*/}
                    {/*       component={AboutPage}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-freelancer-portfolio"}`}*/}
                    {/*       component={HomeFreelancerPortfolio}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-personal-portfolio"}`}*/}
                    {/*       component={HomePersonalPortfolio}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-blog"}`}*/}
                    {/*       component={HomeBlog}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-five-column"}`}*/}
                    {/*       component={HomeFiveColumn}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-four-column"}`}*/}
                    {/*       component={HomeFourColumn}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-three-column"}`}*/}
                    {/*       component={HomeThreeColumn}/>*/}
                    {/*<Route path={`${process.env.PUBLIC_URL + "/home-default"}`}*/}
                    {/*       component={HomeDefault}/>*/}
                    
                    
                </Switch>
            </Router>
        </Fragment>
    );
};

export default App;