
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export const ContactPage: React.FC = () => {
  const { siteContent, t } = useMenu();

  return (
    <div className="bg-sand min-h-[80vh] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-center text-gray-900 mb-12">{siteContent.contactPage.title}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-md h-full">
            <h2 className="text-2xl font-serif font-bold text-greek-blue mb-6">{siteContent.contactPage.infoTitle}</h2>
            <div className="space-y-8">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-greek-gold mt-1 mr-4" />
                <div><h3 className="font-bold text-gray-900">{t('Adresă')}</h3><p className="text-gray-600 whitespace-pre-line">{siteContent.general.address}</p></div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-greek-gold mt-1 mr-4" />
                <div><h3 className="font-bold text-gray-900">{t('Telefon')}</h3><p className="text-gray-600">{siteContent.general.phone}</p></div>
              </div>
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-greek-gold mt-1 mr-4" />
                <div><h3 className="font-bold text-gray-900">{t('Program')}</h3><p className="text-gray-600">{siteContent.general.hours}</p></div>
              </div>
            </div>
          </div>
          <div className="h-96 lg:h-auto bg-gray-200 rounded-lg overflow-hidden shadow-md min-h-[400px]">
             <iframe width="100%" height="100%" src={`https://maps.google.com/maps?q=${encodeURIComponent(siteContent.general.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} frameBorder="0" scrolling="no" title="Locatie Kvala" className="w-full h-full border-0"></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};
