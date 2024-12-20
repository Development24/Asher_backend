import { prismaClient } from "../../index";
import { maintenanceStatus, maintenanceDecisionStatus } from '@prisma/client';
import { MaintenanceWhitelistInput } from "../validations/interfaces/maintenance";

class LandlordMaintenanceService {
  protected inclusion: {
    vendor: boolean;
    property: boolean;
    apartment: boolean;
    category: boolean;
  };

  constructor() {
    this.inclusion = {
      vendor: true,
      property: true,
      apartment: true,
      category: true,
    };
  }

  getRequestedMaintenanceByLandlord = async (landlordId: string, status?: maintenanceStatus) => {
    const maintenanceRequests = await prismaClient.maintenance.findMany({
      where: {
        landlordId: landlordId,
        property: {
          landlordId: landlordId,
        },
        isDeleted: false,
        ...(status && { status: status as any }),
      },
      include: {
        landlord: true,
        ...this.inclusion,
      },
    });
    return maintenanceRequests;
  }
  // get all maintenances on current landlord properties base on status
  getLandlordPropertiesMaintenance = async (landlordId: string, status?: maintenanceStatus) => {
    return await prismaClient.maintenance.findMany({
      where: {
        property: {
          landlordId: landlordId,
        },
        ...(status && { status: status as any }),
        isDeleted: false,
      },
      include: {
        landlord: true,
        tenant: true,
        ...this.inclusion,
      },
    });
  }
  // # get maintenances based on a property 
  getPropertyMaintenances = async (propertyId: string) => {
    const maintenaces = await prismaClient.maintenance.findMany({
      where: {
        propertyId,
        isDeleted: false,
      },
      include: {
        landlord: true,
        ...this.inclusion,
      },
    });
    return maintenaces;
  }
  
  getTenantMaintenance = async (landlordId: string, tenantId: string) => {
    return await prismaClient.maintenance.findMany({
      where: {
        tenantId,
        property: {
          landlordId: landlordId,
        },
        isDeleted: false,
      },
      include: {
        tenant: true,
        ...this.inclusion,
      },
    });
  }

  getRequestedMaintenanceByTenants = async (landlordId: string, status?: maintenanceStatus) => {
    return await prismaClient.maintenance.findMany({
      where: {
        tenantId: {
          not: null,
        },
        landlordDecision: maintenanceDecisionStatus.PENDING,
        property: {
          landlordId: landlordId,
        },
        isDeleted: false,
        ...(status && { status: status as any }),
      },
      include: {
        tenant: true,
        ...this.inclusion,
      },
    });
  }

  changeLandlordPropertiesMaintenanceDecisionState = async (landlordId: string, maintenanceId: string, status?: maintenanceDecisionStatus) => {

    return await prismaClient.maintenance.update({
      where: {
        id: maintenanceId,
        property: {
          landlordId
        }
      },
      data: {
        ...(status && { status: status as any }),
        isDeleted: false,
      },
      include: {
        landlord: true,
        tenant: true,
        ...this.inclusion,
      },
    });
  }
  // changeLandlordPropertiesMaintenanceDecisionState = async (landlordId: string, status?: maintenanceDecisionStatus) => {
  //   return await prismaClient.maintenance.findMany({
  //     where: {
  //       property: {
  //         landlordId: landlordId,
  //       },
  //       ...(status && { landlordDecision: status as any }),
  //       isDeleted: false,
  //     },
  //     include: {
  //       landlord: true,
  //       tenant: true,
  //       ...this.inclusion,
  //     },
  //   });
  // }

  createWhitelist = async (data: MaintenanceWhitelistInput, landlordId: string) => {
    try {
      const whitelistEntry = await prismaClient.maintenanceWhitelist.create({
        data: {
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          propertyId: data.propertyId,
          apartmentId: data.apartmentId || null,
          landlordId: landlordId,
        },
      });

      return whitelistEntry;
    } catch (error) {
      throw new Error(`Error creating whitelist entry: ${error.message}`);
    }
  }

  // Fetch the whitelist for a landlord
  getWhitelistByLandlord = async (landlordId: string) => {
    try {
      const whitelist = await prismaClient.maintenanceWhitelist.findMany({
        where: {
          landlordId: landlordId,
        },
        include: {
          category: true,
          subcategory: true,
          property: true,
          apartment: true,
        },
      });

      return whitelist;
    } catch (error) {
      throw new Error(`Error fetching whitelist: ${error.message}`);
    }
  }

  // Update an existing whitelist entry
  updateWhitelist = async (whitelistId: string, data: MaintenanceWhitelistInput) => {
    try {
      const updatedWhitelist = await prismaClient.maintenanceWhitelist.update({
        where: { id: whitelistId },
        data: {
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          propertyId: data.propertyId,
          apartmentId: data.apartmentId,
        },
      });

      return updatedWhitelist;
    } catch (error) {
      throw new Error(`Error updating whitelist: ${error.message}`);
    }
  }
  deleteMaintenance = async (maintenanceId: string) => {
    return await prismaClient.maintenance.update({
      where: {
        id:maintenanceId
      },
      data:{
        isDeleted:true
      }
    })
  } 
}

export default new LandlordMaintenanceService();
