import React from 'react';
import ServiceEngineerNav from './service-engineer/ServiceEngineerNav';

const ServiceEngineerSidebar = ({ isOpen = true, onClose }) => {
  return <ServiceEngineerNav isOpen={isOpen} onClose={onClose} />;
};

export default ServiceEngineerSidebar;
