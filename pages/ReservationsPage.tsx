
import React, { useState } from 'react';
import { Clock, MessageCircle, Loader2, ShieldCheck } from 'lucide-react';
import { ReservationData } from '../types';
import { useMenu } from '../context/MenuContext';
import { dbService } from '../services/db';

export const ReservationsPage: React.FC = () => {
  const { siteContent, t } = useMenu();
  const [formData, setFormData] = useState<ReservationData>({
    date: '', time: '', guests: 2, name: '', phone: '', notes: ''
  });
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprAccepted) {
      alert(t("gdprAlert"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dbService.saveReservation(formData);
      
      const message = `*Rezervare Nouă Kvala* 🇬🇷\n\n📅 Data: ${formData.date}\n⏰ Ora: ${formData.time}\n👥 Persoane: ${formData.guests}\n👤 Nume: ${formData.name}\n📞 Tel: ${formData.phone}\n📝 Note: ${formData.notes || '-'}`;
      const cleanPhone = siteContent.general.phone.replace(/\D/g, '').replace(/^0/, '40');
      
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Reservation Error:", error);
      alert(t("errorAlert"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.name === 'guests' ? Number(e.target.value) : e.target.value }));
  };

  const inputStyles = "w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-greek-blue focus:border-greek-blue outline-none transition-all placeholder-gray-400";

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-sand px-4">
        <div className="bg-white p-10 rounded-lg shadow-xl max-w-lg w-full text-center border-t-4 border-green-500 animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6"><MessageCircle className="h-10 w-10 text-green-600" /></div>
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">{t("Solicitare Trimisă!")}</h2>
          <p className="text-gray-600 mb-8">{t("reservationSuccessText")}</p>
          <button onClick={() => setIsSuccess(false)} className="bg-greek-blue text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition">{t("Fă o altă rezervare")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sand min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{siteContent.reservationsPage.title}</h1>
          <p className="text-gray-600">{siteContent.reservationsPage.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          <div className="bg-greek-blue p-8 md:w-1/3 text-white flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-6">{siteContent.reservationsPage.infoTitle}</h3>
              <p className="mb-6 text-blue-100 text-sm leading-relaxed">{siteContent.reservationsPage.infoText}</p>
              <div className="flex items-center"><Clock className="h-5 w-5 mr-3 text-blue-200" /><div className="text-sm font-bold">{siteContent.general.hours}</div></div>
            </div>
            <div className="mt-8 pt-8 border-t border-blue-400">
               <p className="text-xs text-blue-200 uppercase tracking-widest mb-1">{siteContent.reservationsPage.helpText}</p>
               <p className="text-xl font-bold">{siteContent.general.phone}</p>
            </div>
          </div>
          <div className="p-8 md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("Data Rezervării")}</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputStyles} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("Ora")}</label>
                  <select name="time" required value={formData.time} onChange={handleChange} className={inputStyles}>
                    <option value="">{t("Selectează ora")}</option>
                    {['12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("Numele tău")}</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputStyles} placeholder={t("Nume complet")} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("Telefon")}</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputStyles} placeholder="07xx xxx xxx" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("Nr. Persoane")}</label>
                <input type="number" name="guests" min="1" max="30" value={formData.guests} onChange={handleChange} className={inputStyles} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t("Note")}</label>
                <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className={inputStyles} placeholder={t("ex: Preferăm o masă pe terasă...")}></textarea>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                 <input type="checkbox" id="gdpr" checked={gdprAccepted} onChange={(e) => setGdprAccepted(e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-greek-blue focus:ring-greek-blue cursor-pointer" />
                 <label htmlFor="gdpr" className="text-[11px] text-gray-500 leading-tight cursor-pointer">
                   {t("gdprText")}
                 </label>
              </div>
              <button type="submit" disabled={isSubmitting || !gdprAccepted} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center gap-3 shadow-xl text-lg disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                {t("Finalizează pe WhatsApp")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
