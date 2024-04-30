declare module 'firebase' {
    namespace firebase {
        function apps(): firebase.app.App[];
        function app(name?: string): firebase.app.App;
    }
}
