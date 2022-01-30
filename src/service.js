//Optional code to register a service 

import { report } from "process";

const isLocalhost = Boolean(
    window.location.hostname == 'localhost' ||
    //[::1] IPv6 localhost Adresse
    window.location.hostname == '[::1]' ||
    //127.0.0.1:7545 localhost IPv4
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/ 
    )
);

export function register(config)
{
    if(process.env.NODE_ENV === 'production' && 'service' in navigator)
    {
        //URL constructor
        const publicURL = new URL(process.env.PUBLIC_URL, window.location.href);
        if(publicURL.origin !== window.location.origin)
        {
            //Won't work
            return;
        }
        window.addEventListener('load', () =>
        {
            const serviceURL = `${process.env.PUBLIC_URL}/service.js`;

            if (isLocalhost)
            {
                //running on localhost, check on service
                checkValidService(serviceURL, config);

                //additonal logging to localhost
                //Service / PWA Documentation
                navigator.serviceWorker.ready.then(() =>
                {
                    console.log('This web app is being served cache-first by a service'
                    + 'worker. To learn more visit the CRA-PWA Page');
                }); 
            }
            else
            {
                //no localhost, register service
                registerValid(serviceURL, config);
            }
        });
    }
}
function registerValid(serviceURL, config)
{
    navigator.serviceWorker
    .register(serviceURL)
    .then(registration => 
        {
            registration.onupdatefound = () =>
            {
                const installing = registration.installing;
                if(installing == null)
                {
                    return;
                }
                installing.onstatechange = () =>
                {
                    if(installing.state === 'installed')
                    {
                        if(navigator.serviceWorker.controller)
                        {
                            console.log( 'New content is available and will be used when all ' +
                            'tabs for this page are closed. See https://bit.ly/CRA-PWA.');
                            //callback
                            if(config && config.onUpdate)
                            {
                                config.onUpdate(registration);
                            }
                        }
                        else
                        {
                            console.log('Content cached for offline use');
                            //callback
                            if(config && config.onSuccess)
                            {
                                config.onSuccess(registration)
                            }
                        }
                    }
                }
            }
        })
    .catch(error =>
        {
            console.error('Error during service registration... \n:', error);
        })
}
function checkValidService(serviceURL, config)
{
    fetch(serviceURL)
    .then(response =>
        {
            const contentType = response.headers.get('content-type');
            if(response.status === 404
                || (contentType!=null && contentType.indexOf('javascript') === -1))
                {
                    navigator.serviceWorker.ready.then(registration => 
                        {
                            registration.unregister().then(() => 
                            {
                                window.location.reload();
                            });
                        });
                }
                else
                {
                    registerValid(serviceURL, config);
                }
        })
        .catch(() =>
        {
            console.log('No internet connection found. App is running in offline mode')
        })
}
export function unregister()
{
    if('service' in navigator)
    {
        navigator.serviceWorker.ready.then(registration =>
            {
                registration.unregister()
            })
    }
}