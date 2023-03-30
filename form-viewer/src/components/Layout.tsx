import React, {ReactNode} from 'react';
import {Container, Navbar, Nav, Button} from 'react-bootstrap';
import {BsArrowLeft, BsDownload} from "react-icons/bs";
import RoutingConstants from "../constants/RoutingConstants";

type LayoutProps = {
    onClickBack?: React.MouseEventHandler<HTMLButtonElement> | undefined;
    children: ReactNode;
    title: string;
    specialButton?: ReactNode;
};
const styles = {
    content: {
        paddingBottom: '3.5rem', // Height of the navbar
    },
};

const Layout: React.FC<LayoutProps> = (props) => {
    return (
        <Container fluid style={styles.content}>
            {props.children}
            <Navbar fixed="bottom" className="justify-content-between custom-navbar">
                {
                    props.onClickBack ? <Nav.Item className="px-3">
                        <Button variant="secondary" onClick={props.onClickBack}>
                            <BsArrowLeft/>
                        </Button>
                    </Nav.Item> : <Nav.Item className={"px-3"}/>
                }

                <Navbar.Text>{props.title}</Navbar.Text>
                <Nav.Item className="px-3">
                    {props.specialButton}
                </Nav.Item>
            </Navbar>
        </Container>
    );
};

export default Layout;