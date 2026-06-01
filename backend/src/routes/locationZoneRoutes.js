import express from 'express';
import { getLocationZones, createLocationZone } from '../controller/locationZoneControllers.js';

const route = express.Router();

route.get('/', getLocationZones);
route.post('/', createLocationZone);

export default route;
