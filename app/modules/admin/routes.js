//THIS IS THE CONTROLLER FOR ADMIN

//module used in this controller
var express = require('express');

//declaration of routes
var router = express.Router();
var authMiddleware = require('../../core/auth');
var db = require('../../lib/database')();

router.use(authMiddleware.hasAuth);



router.get('/', (req,res) =>{
	 db.query(`SELECT COUNT(*) as appctr FROM tblProvider WHERE intProviderStatus=0 `, (err,applicantCtr,fields) =>{
    res.render('admin/views/adminDashboard',  {applicant:applicantCtr[0].appctr,user: `${req.session.user.strAdminFName}`+" "+`${req.session.user.strAdminLName}`});
});
});

router.post('/', (req,res) =>{

    res.render('admin/views/adminDashboard', {user: `${req.session.user.strAdminFName}`+" "+`${req.session.user.strAdminLName}`});
});

router.get('/confirmationOfBusinessman', (req,res) =>{


      db.query(`SELECT * from \`tblProvider\` where \`intProviderStatus\` = ${0} `, (err,results,fields) =>{
				console.log(results);
        if (results.length < 0 || results.length == 'NULL'){
            res.render('admin/views/confirmationOfBusinessman', {user: `${req.session.user.strAdminFName}`+" "+`${req.session.user.strAdminLName}` });

        }
        else{
            res.render('admin/views/confirmationOfBusinessman', {user: `${req.session.user.strAdminFName}`+" "+`${req.session.user.strAdminLName}`, content: results} );
        }

      });

});

router.post('/confirmationOfBusinessman', (req,res)=>{
	var Split=`${req.body.location}`.split(",");
	var city=Split[0];
	var province=Split[1];
	console.log(city);
	console.log(province);
    db.query(`UPDATE \`tblProvider\` SET \`strProviderBusinessName\` = "${req.body.businessName}", \`strProviderDTI\` = "${req.body.dti}", \`strProviderBIR\` = "${req.body.bir}", \`intProviderStatus\` = ${1}, \`intAdminID\` = ${req.session.user.intAdminID}, \`strCity\`="${city}" , \`strProvince\`="${province}" where \`intProviderID\` = ${req.body.idnumber} `, (err,results,fields)=>{
       if (err) console.log(err);
       res.redirect('/admin');
    });
});

router.post('/rejectionOfBusinessman', (req,res)=>{

    db.query(`UPDATE \`tblProvider\` SET  \`intProviderStatus\` = ${2} where \`intProviderID\` = ${req.body.idnumber} `, (err,results,fields)=>{
       if (err) console.log(err);
       res.redirect('/admin');
    });
});

router.get('/confirmationOfRequest', (req,res)=>{

            res.render('admin/views/confirmationOfRequest', {user: `${req.session.user.strAdminFName}`+" "+`${req.session.user.strAdminLName}`});


});

router.post('/approveItemRequest', (req,res)=>{
    db.query(`UPDATE \`tblitem\` SET \`intitemStatus\` = ${1}, \`intAdminID\` = ${req.session.user.intAdminID} where intItemNo = ${req.body.itemno} `, (err,results,fields)=>{
       if (err) console.log(err);
       res.redirect('/admin/confirmationofRequest');
   });
});

router.post('/approveServiceRequest', (req,res)=>{
   db.query(`UPDATE \`tblgenservice\` SET \`intServiceStatus\` = ${1}, \`intAdminID\` = ${req.session.user.intAdminID} where intgenServiceNo = ${req.body.serviceno} `, (err,results,fields)=>{
       if (err) console.log(err);
       res.redirect('/admin/confirmationofRequest');
   });
});

router.post('/rejectServiceRequest', (req,res)=>{
   db.query(`UPDATE \`tblgenservice\` SET \`intServiceStatus\` = ${2}, \`intAdminID\` = ${req.session.user.intAdminID} where intgenServiceNo = ${req.body.serviceno}`, (err,results,fields)=>{
       if (err) console.log(err);
       res.redirect('/admin/confirmationofRequest');
   });
});

router.post('/rejectItemRequest', (req,res)=>{
   db.query(`UPDATE \`tblitem\` SET \`intitemStatus\` = ${2}, \`intAdminID\` = ${req.session.user.intAdminID}  where intItemNo = ${req.body.itemno} `, (err,results,fields)=>{
       if (err) console.log(err);
       res.redirect('/admin/confirmationofRequest');
   });
});





exports.admin = router;
