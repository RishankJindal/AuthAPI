import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 15
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        match: [/^\S+$/, 'Password should not contain spaces']
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});



const userModel = mongoose.model("User", userSchema);

export default userModel;
