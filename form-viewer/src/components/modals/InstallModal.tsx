import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const InstallModal = () => {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(localStorage.getItem('installPromptDismissed') === 'true');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem('installPromptDismissed', 'true');
        setDismissed(true);
    };

    const handleInstall = () => {
        console.log("Install clicked");
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult:any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    setShow(false);
                    localStorage.setItem('installPromptDismissed', 'true');
                } else {
                    console.log('User dismissed the install prompt');
                }
                setDeferredPrompt(null);
            });
        }
    };

    if (show && !dismissed) {

        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Install My PWA</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Click the button below to install My PWA and use it offline. You can always install it later from the
                        browser's menu.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Dismiss
                    </Button>

                    <Button id={"install-button"} variant="primary" onClick={handleInstall}>
                        Install
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return null;
};

export default InstallModal;
