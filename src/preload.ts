// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import remote from '@electron/remote';

const draggableElement = document.querySelector('#drag-handle') as HTMLElement;

draggableElement.addEventListener('mousedown', (event) => {

    remote.getCurrentWindow().setIgnoreMouseEvents(false);

    const { screenX, screenY } = event;
    const { x, y } = remote.getCurrentWindow().getBounds();

    const onMouseMove = (event: MouseEvent) => {
        const { screenX: currentScreenX, screenY: currentScreenY } = event;

        remote.getCurrentWindow().setPosition(x + currentScreenX - screenX, y + currentScreenY - screenY);
    }

    const onMouseUp = () => {
        remote.getCurrentWindow().setIgnoreMouseEvents(true);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    event.preventDefault();

    return false;

}, {
    passive: false
});
