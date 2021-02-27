// start chrome with --kiosk-printing to hide print dialog and use default printer
// https://stackoverflow.com/questions/21073959/print-without-confirmation-on-google-chrome

export function printHtml (html: string) {
    const w = window.open("", "", "menubar=no,location=no,status=no");
    w.document.body.innerHTML = html;
    w.print();
    w.close();
}
