import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

export const Header = () => {
	return (
		<Navbar bg="light" expand="lg" className="justify-content-between">
			<Container fluid>
				<Navbar.Brand href="/scout">
					<img
						src="/logo.svg" // Replace with your logo's path
						width="30"
						height="30"
						className="d-inline-block align-top"
						alt="Scout Pro logo"
					/>
					Scout Pro
				</Navbar.Brand>
				<Nav>
					<NavDropdown title="John Hel Gumban" id="basic-nav-dropdown" alignRight>
						<NavDropdown.Item href="#action/3.1">Manage Subscription</NavDropdown.Item>
						<NavDropdown.Item href="#action/3.2">Scout Pro Benefits</NavDropdown.Item>
						<NavDropdown.Item href="#action/3.3">Give Feedback</NavDropdown.Item>
						<NavDropdown.Divider />
						<NavDropdown.Item href="#action/3.4">Log Out</NavDropdown.Item>
					</NavDropdown>
				</Nav>
			</Container>
		</Navbar>
	);
};
