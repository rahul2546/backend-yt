import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    Channel: {
        type: Schema.Types.ObjectId, // one who is being subscribed to
        ref: "User"
    },
}, {timestamps: true})

export const Subcription = mongoose.model("Subscription", subscriptionSchema)



