const User=require('../models/User');

exports.getAllUsers=async(req,res)=>{
    try{
        const users=await User.find();
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message:"Failed to fetch users",error:error.message});
    }
};

exports.getUserByEmployeeId = async (req, res) => {

    try {

        const user = await User.findOne({
            employeeId: req.params.employeeId
        });

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.createUser=async(req,res)=>{
    try{
        const user=await User.create(req.body);
        res.status(201).json(user);
    }catch(error){
        res.status(500).json({message:"Failed to create user",error:error.message});
    }
};
