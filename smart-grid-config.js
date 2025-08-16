var smartgrid = require('smart-grid');

/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'scss',
    /* less || scss || sass || styl */
    columns: 12,
    /* number of grid columns */
    offset: '1.5%',
    /* gutter width px || % || rem */
    mobileFirst: false,
    /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1200px',
        /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        
        
        
                
        nestHubMax: {
            width: '1280px',
            height: '800px'
        },
        
        lg: {
            width: '1100px',
            /* -> @media (max-width: 1100px) */
        },
        
        iPadPro: {
            width: '1024px',
            height: '1336px'
        },
        nestHub: {
            width: '1024px',
            height: '600px'
        },
        
        md: {
            width: '960px'
        },
        
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        
        iPad: {
            width: '768px',
            height: '1024px'
        },
        
        xs: {
            width: '560px'
        },
        
        surfaceDUO: {
            width: '540px',
            height: '720px'
        },
        iPhone678Plus: {
            width: '414px',
            height: '736px'
        },
        pixel2XL: {
            width: '411px',
            height: '823px'
        },
        pixel2: {
            width: '411px',
            height: '731px'
        },
        iPhoneX: {
            width: '375px',
            height: '812px'
        },
        iPhone678: {
            width: '375px',
            height: '667px'
        },
        galaxyS5: {
            width: '360px',
            height: '640px'
        },
        iPhone5SE: {
            width: '320px',
            height: '568px'
        },
        galaxyFold: {
            width: '280px',
            height: '653px'
        },
        
        
        
    
        /* 
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};

smartgrid('./app/scss/smartgrid', settings);
