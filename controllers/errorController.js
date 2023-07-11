const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const error = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${error.join('. ')}`;
    return new AppError(message,400);
}

const handleDuplicateFeildsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate Feild value ${value}. Please use another value`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    // A) API
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // B) Rendered Website
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong! Dev',
        msg: err.message
    });
};

const sendErrorProd = (err, req, res) => {
    // A) API
    if(req.originalUrl.startsWith('/api')) {
        // A) Operational trusted error: send message to client
        if(err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        // B) programming or any unknown error don't leak error details
        // 1) Log error
        console.error('Error!', err);
        // 2) Send generic message
        res.status(err.statusCode).json({
            status: 'error',
            message: 'Something went very wrong! Prod'
        });
    
    }

    // B) Rendered Website
    // A) Operational, trusted error: send message to client
    if(err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong! prod',
            msg:  'Please try again later.'
        });
    }
};

const handleJWTError = () => new AppError('Invalid token Please Login again', 401);
const handleTokenExpireError = () => new AppError('Token has Expired. Invalid', 401);

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if(process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);

        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFeildsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleTokenExpireError();

        sendErrorProd(error, req, res);
    }
    
};