//mongo quwery



const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        return next(err);
    }
    if (!users) {
        return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json({ users })

};

const addUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name && name.trim() == "" && !email && email.trim() === "" && !password && password.length > 6) {
        return res.status(422).json({ message: "Invalid Data" });
    }

    let user;
    try {
        user = new User({
            name,
            email,
            password
        });
        user = user.save();
    } catch (err) {
        return next(err);
    }
    if (!user) {
        return res.status(500).json({ message: "Unable to save user" });
    }
    return res.status(201).json({ user })
};

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { name, email, password } = req.body;
    console.log("name: " + name, "email: "+ email,"password: "+  password);
    if (!name && name.trim() == "" && !email && email.trim() === "" && !password && password.length > 6) {
        return res.status(422).json({ message: "Invalid Data" });
    }
    let user;
    try {
        user = await User.findByIdAndUpdate(id, { name, email, password })
        console.log(user);
        console.log("hi");
    } catch (err) {
        console.log(err)
        return next(err);
    }
    if(!user){
        return res.status(500).json({message : "Unable to save user"});
    }
    return res.status(200).json({message : "Updated Successfully"})
}

exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;