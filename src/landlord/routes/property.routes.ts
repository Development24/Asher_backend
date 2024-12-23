import { Router } from "express";
import { Authorize } from "../../middlewares/authorize";
import PropertyController from "../controllers/properties.controller";
import SettingController from "../controllers/setting.controller";
import upload from "../../configs/multer";
import { uploadToCloudinary } from "../../middlewares/multerCloudinary";

class ApartmentLandlordRouter {
    public router: Router;
    authenticateService: Authorize

    constructor() {
        this.router = Router()
        this.authenticateService = new Authorize()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        // landlord properties
        this.router.patch('/property/showcase/:propertyId', PropertyController.showCaseRentals)
        this.router.post('/property/property-listing', PropertyController.createPropertyListing);
        this.router.get('/property/property-listing', PropertyController.getLandlordPropertyListing);
        this.router.get('/property', PropertyController.getCurrentLandlordProperties)
        this.router.post('/property', upload.array('files'), uploadToCloudinary, PropertyController.createProperty)
        this.router.delete('/property/:propertyId', PropertyController.deleteLandlordProperties)
        this.router.patch('/property/status/:propertyId', PropertyController.updatePropertyAvailability)
        this.router.get('/property/showcased', PropertyController.getShowCasedRentals)

        //   settings 
        this.router.post('/settings', SettingController.createPropApartmentSetting);
        this.router.get('/settings', SettingController.getAllPropsApartSetting);
        this.router.get('/settings/:id', SettingController.getById);
        this.router.patch('/settings/:id', SettingController.updatePropsApartSetting);
        this.router.delete('/settings/:id', SettingController.deletePropsApartmentSetting);
        // Route to create a global setting
        this.router.post('/settings/global', SettingController.createGlobalSetting);
        // Route to get all global settings
        this.router.get('/settings/global', SettingController.getAllGlobalSettings);
        // Route to update a specific global setting
        this.router.put('/settings/global/:id', SettingController.updateLandlordGlobalSetting);
        // Route to delete a specific global setting
        this.router.delete('/settings/global/:id', SettingController.deleteLandlordGlobalSetting);

    }
}

export default new ApartmentLandlordRouter().router